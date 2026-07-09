import { z } from 'zod';

export const reviewLinkedInSchema = z.object({
  body: z.object({
    profileSection: z.string().min(1, 'Profile section identifier is required'),
    text: z.string().min(1, 'Original section text is required'),
  })
});
