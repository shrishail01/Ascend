import { z } from 'zod';

export const linkedinReviewSchema = z.object({
  confidence: z.number().min(0).max(100),
  reasoning: z.string(),
  overallScore: z.number().min(0).max(100),
  sections: z.array(z.object({
    name: z.string(),
    score: z.number().min(0).max(100),
    current: z.string(),
    improved: z.string(),
    tips: z.string()
  })),
  metadata: z.object({
    model: z.string(),
    promptVersion: z.string(),
    generatedAt: z.string(),
    processingTime: z.number().optional()
  })
});

export default linkedinReviewSchema;
