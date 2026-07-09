import { GoogleGenerativeAI } from '@google/generative-ai';
import aiConfig from '../../config/ai.config';
import SystemConfig from '../../models/SystemConfig';
import crypto from 'crypto';
import { AuditLog } from '../../models/AuditLog';
import { FeatureUsage } from '../../models/FeatureUsage';
import { Subscription } from '../../models/Subscription';
import { cacheService } from '../cache.service';
import TokenCounter from './tokenCounter';
import ResponseParser from './responseParser';
import { z } from 'zod';
import logger from '../../utils/logger';

let genAI: GoogleGenerativeAI | null = null;

function getGenAI() {
  if (!genAI) {
    const key = process.env.GEMINI_API_KEY;
    if (!key && process.env.NODE_ENV !== 'test') {
      throw new Error('GEMINI_API_KEY is not defined in environment variables');
    }
    genAI = new GoogleGenerativeAI(key || 'dummy-key-for-tests');
  }
  return genAI;
}

export interface AIGatewayOptions {
  userId: string;
  featureName: string;
  promptVersion: string;
  zodSchema: z.ZodSchema<any>;
  systemInstruction?: string;
  streaming?: boolean;
  onStreamChunk?: (chunkText: string) => void;
}

const planLimits: Record<string, number> = {
  Free: 5,
  Premium: 500,
  Basic: 50,
  Pro: 500,
  Enterprise: 5000,
};

/**
 * Enterprise AI Gateway.
 * Coordinates rate limiting, caching, SDK execution, Zod validation, retries, and costs estimation.
 */
export class AIGateway {
  static async request(prompt: string, options: AIGatewayOptions): Promise<any> {
    const { userId, featureName, promptVersion, zodSchema, systemInstruction, streaming, onStreamChunk } = options;
    const start = Date.now();

    // 1. Feature Flag / Feature enablement check (SystemConfig)
    const sysConfig = await SystemConfig.findOne();
    if (sysConfig) {
      const flag = (sysConfig.featureFlags as any[]).find(f => f.featureName === featureName);
      if (flag && flag.enabled === false) {
        throw new Error(`AI_FEATURE_DISABLED: ${featureName} is currently disabled by system administrator.`);
      }
    }

    // 2. Subscription monthly limits verification
    const subscription = await Subscription.findOne({ userId });
    const plan = subscription ? subscription.plan : 'Free';
    const limit = planLimits[plan] || 5;

    let usage = await FeatureUsage.findOne({ userId, featureName, resetDate: { $gt: new Date() } });
    if (!usage) {
      const resetDate = new Date();
      resetDate.setMonth(resetDate.getMonth() + 1);
      usage = await FeatureUsage.create({
        userId,
        featureName,
        count: 0,
        limit,
        resetDate,
      });
    }

    if (usage.count >= usage.limit) {
      throw new Error(`AI_LIMIT_EXCEEDED: Monthly limit of ${usage.limit} reached for ${featureName}.`);
    }

    // 3. Prompt cache check
    const cacheKey = crypto.createHash('sha256').update(prompt + (systemInstruction || '')).digest('hex');
    const cachedResponse = await cacheService.get<any>(`ai_cache:${cacheKey}`);
    if (cachedResponse) {
      logger.info(`CACHE HIT: Reusing cached response for prompt hash: ${cacheKey}`);
      usage.count += 1;
      await usage.save();
      return cachedResponse;
    }

    // 4. SDK Content Generation setup
    let modelName = aiConfig.modelName;
    let temperature = aiConfig.temperature;
    let topP = aiConfig.topP;
    let topK = aiConfig.topK;
    let maxOutputTokens = aiConfig.maxOutputTokens;

    if (sysConfig && sysConfig.aiConfig) {
      modelName = sysConfig.aiConfig.modelName || modelName;
      temperature = sysConfig.aiConfig.temperature ?? temperature;
      topP = sysConfig.aiConfig.topP ?? topP;
      topK = sysConfig.aiConfig.topK ?? topK;
      maxOutputTokens = sysConfig.aiConfig.maxOutputTokens ?? maxOutputTokens;
    }

    const model = getGenAI().getGenerativeModel({
      model: modelName,
      safetySettings: aiConfig.safetySettings as any,
      generationConfig: {
        temperature,
        topP,
        topK,
        maxOutputTokens,
        responseMimeType: 'application/json',
      },
      systemInstruction: systemInstruction || undefined,
    });

    const callAI = async (): Promise<string> => {
      if (streaming && onStreamChunk) {
        const resultStream = await model.generateContentStream({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
        });
        let accumulated = '';
        for await (const chunk of resultStream.stream) {
          const chunkText = chunk.text();
          accumulated += chunkText;
          onStreamChunk(chunkText);
        }
        return accumulated;
      } else {
        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
        });
        return result.response.text();
      }
    };

    const runWithRetry = async (retries = 2, delay = 1000): Promise<string> => {
      try {
        return await callAI();
      } catch (err: any) {
        const isRetryable =
          err.status === 429 ||
          err.status === 503 ||
          err.message?.includes('timeout') ||
          err.code === 'ECONNRESET';
        if (retries > 0 && isRetryable) {
          logger.warn(`AI GATEWAY RETRY: Retrying content generation. Retries remaining: ${retries}`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          return runWithRetry(retries - 1, delay * 2);
        }
        throw err;
      }
    };

    let textResponse = '';
    let parsedData: any = null;
    let validatedData: any = null;
    let zodError: any = null;

    let duration = 0;
    // Validate using Zod with 1x auto-retry fallback loop on validation failures
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        textResponse = await runWithRetry();
        parsedData = ResponseParser.parseCleanJSON(textResponse);
        duration = Date.now() - start;

        // Inject versioning metadata before parsing so validation passes
        if (parsedData && typeof parsedData === 'object') {
          parsedData.metadata = {
            model: modelName,
            promptVersion,
            generatedAt: new Date().toISOString(),
            processingTime: duration,
          };
        }

        validatedData = zodSchema.parse(parsedData);
        zodError = null;
        break;
      } catch (err: any) {
        if (err instanceof z.ZodError) {
          zodError = err;
          logger.warn(`AI VALIDATION FAILURE: Attempt ${attempt} failed. Error: ${err.message}`);
          if (attempt === 1) {
            continue;
          }
        }
        throw err;
      }
    }

    if (zodError) {
      throw new Error(`AI_VALIDATION_ERROR: Zod validation failed after auto-retry. ${zodError.message}`);
    }

    // 5. Cost Metrics estimation
    const promptTokens = TokenCounter.approximate(prompt + (systemInstruction || ''));
    const responseTokens = TokenCounter.approximate(textResponse);
    const totalTokens = promptTokens + responseTokens;
    const costEstimate = (promptTokens * 0.000075 + responseTokens * 0.0003) / 1000;

    // 6. Update usage counts
    usage.count += 1;
    await usage.save();

    // 7. Write Audit logging
    await AuditLog.create({
      userId,
      action: `ai_${featureName}`,
      details: JSON.stringify({
        promptVersion,
        duration,
        promptTokens,
        responseTokens,
        totalTokens,
        costEstimate,
        model: modelName,
      }),
    });

    // 8. Cache response payload
    await cacheService.set(`ai_cache:${cacheKey}`, validatedData, 60 * 60 * 12);

    return validatedData;
  }
}

export default AIGateway;
