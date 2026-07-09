import { z } from 'zod';

export const createSubscriptionSchema = z.object({
  body: z.object({
    plan: z.enum(['Free', 'Premium']),
  })
});
