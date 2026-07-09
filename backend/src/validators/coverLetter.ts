import { z } from 'zod';

export const generateCoverLetterSchema = z.object({
  body: z.object({
    jobTitle: z.string().min(1, 'Job title is required'),
    company: z.string().min(1, 'Company is required'),
    jd: z.string().optional(),
  })
});
