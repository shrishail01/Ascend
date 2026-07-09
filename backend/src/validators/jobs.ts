import { z } from 'zod';

export const saveJobSchema = z.object({
  body: z.object({
    id: z.string().optional(),
    company: z.string().min(1, 'Company name is required'),
    role: z.string().min(1, 'Role details are required'),
    jobUrl: z.string().url('Invalid URL format').optional().or(z.literal('')),
    status: z.enum(['Wishlist', 'Applied', 'Interview', 'Offer', 'Rejected', 'Joined']).default('Wishlist'),
    salary: z.string().optional(),
    notes: z.string().optional(),
    appliedDate: z.string().optional(),
    reminderDate: z.string().optional(),
  })
});
