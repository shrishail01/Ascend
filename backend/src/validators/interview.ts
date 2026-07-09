import { z } from 'zod';

export const startInterviewSchema = z.object({
  body: z.object({
    jobTitle: z.string().min(1, 'Job title is required'),
    company: z.string().min(1, 'Company is required'),
    type: z.enum(['hr', 'technical', 'behavioral']),
  })
});

export const scoreInterviewSchema = z.object({
  body: z.object({
    sessionId: z.string().min(1, 'Session ID is required'),
    answers: z.array(z.object({
      questionId: z.string().min(1, 'Question ID is required'),
      question: z.string().min(1, 'Question text is required'),
      answer: z.string().min(1, 'Answer is required'),
    }))
  })
});
