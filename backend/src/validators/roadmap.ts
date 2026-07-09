import { z } from 'zod';

export const generateRoadmapSchema = z.object({
  body: z.object({
    currentRole: z.string().min(1, 'Current role is required'),
    targetRole: z.string().min(1, 'Target role is required'),
    skills: z.string().optional(),
    experience: z.string().optional(),
  })
});
