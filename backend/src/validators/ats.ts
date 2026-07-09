import { z } from 'zod';

export const analyzeATSSchema = z.object({
  body: z.object({
    resumeText: z.string().min(1, 'Resume text is required'),
    jd: z.string().min(1, 'Job description is required'),
  })
});
