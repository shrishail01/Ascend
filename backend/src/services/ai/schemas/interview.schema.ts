import { z } from 'zod';

export const interviewQuestionsSchema = z.object({
  id: z.string(),
  questions: z.array(z.object({
    id: z.string(),
    question: z.string(),
    tips: z.string().optional(),
    sampleAnswer: z.string().optional()
  }))
});

export const interviewScoreSchema = z.object({
  confidence: z.number().min(0).max(100),
  reasoning: z.string(),
  overallScore: z.number().min(0).max(100),
  feedback: z.string(),
  questionFeedback: z.array(z.object({
    question: z.string(),
    answer: z.string(),
    score: z.number().min(0).max(100),
    strengths: z.string(),
    improvements: z.string()
  })),
  metadata: z.object({
    model: z.string(),
    promptVersion: z.string(),
    generatedAt: z.string(),
    processingTime: z.number().optional()
  })
});
