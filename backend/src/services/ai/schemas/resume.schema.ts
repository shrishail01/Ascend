import { z } from 'zod';

export const resumeOptimizeSchema = z.object({
  confidence: z.number().min(0).max(100),
  reasoning: z.string(),
  optimizedSummary: z.string(),
  improvedBullets: z.array(z.string()),
  metadata: z.object({
    model: z.string(),
    promptVersion: z.string(),
    generatedAt: z.string(),
    processingTime: z.number().optional()
  })
});

export default resumeOptimizeSchema;
