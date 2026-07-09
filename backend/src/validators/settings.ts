import { z } from 'zod';

export const updateSettingsSchema = z.object({
  body: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    linkedInUrl: z.string().url('Invalid URL format').optional().or(z.literal('')),
    currentRole: z.string().optional(),
    targetRole: z.string().optional(),
  })
});
