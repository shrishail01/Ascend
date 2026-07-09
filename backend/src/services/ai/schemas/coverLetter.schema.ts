import { z } from 'zod';

export const coverLetterSchema = z.object({
  confidence: z.number().min(0).max(100),
  reasoning: z.string(),
  content: z.string(),
  tone: z.string(),
  metadata: z.object({
    model: z.string(),
    promptVersion: z.string(),
    generatedAt: z.string(),
    processingTime: z.number().optional()
  })
});

export default coverLetterSchema;
