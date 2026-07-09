import { z } from 'zod';

export const saveResumeSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    template: z.string().default('modern'),
    content: z.string().min(1, 'Content JSON is required'),
  })
});
