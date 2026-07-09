import { z } from 'zod';

export const suggestProjectsSchema = z.object({
  body: z.object({
    skills: z.string().min(1, 'Skills are required'),
    targetRole: z.string().optional(),
    level: z.string().optional(),
  })
});
