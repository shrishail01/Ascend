import AIGateway from './gateway.service';
import ContextBuilderService from './contextBuilder.service';
import prompts from '../../prompts/ats.prompt';
import { atsAnalysisSchema, atsOptimizeSchema } from './schemas/ats.schema';

/**
 * Service managing ATS analysis prompts delegating calls to AIGateway.
 */
export class ATSAIService {
  static async analyzeATS(userId: string, resumeText: string, jobDescription: string): Promise<any> {
    const cleanResume = ContextBuilderService.cleanContext(resumeText);
    const cleanJob = ContextBuilderService.cleanContext(jobDescription);
    const promptDef = prompts.v1;

    const fullPrompt = promptDef.userPrompt({ resumeText: cleanResume, jobDescription: cleanJob });

    return await AIGateway.request(fullPrompt, {
      userId,
      featureName: 'ats',
      promptVersion: promptDef.version,
      zodSchema: atsAnalysisSchema,
      systemInstruction: `${promptDef.systemPrompt}\n${promptDef.developerInstructions}`,
    });
  }

  static async optimizeResume(userId: string, resumeText: string, jobDescription: string): Promise<any> {
    const cleanResume = ContextBuilderService.cleanContext(resumeText);
    const cleanJob = ContextBuilderService.cleanContext(jobDescription);
    const promptDef = prompts.v1;

    const promptText = `Optimize the following candidate resume for the target job description. Add missing keywords, improve metrics, and format sections cleanly.\nResume: ${cleanResume}\nJob Description: ${cleanJob}`;

    return await AIGateway.request(promptText, {
      userId,
      featureName: 'ats',
      promptVersion: promptDef.version,
      zodSchema: atsOptimizeSchema,
      systemInstruction: `${promptDef.systemPrompt}\n${promptDef.developerInstructions}`,
    });
  }
}

export default ATSAIService;
