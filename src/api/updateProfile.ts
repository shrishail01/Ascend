import { z } from 'zod';
import { createEndpoint, Users } from 'zite-integrations-backend-sdk';

export default createEndpoint({
  authenticated: true,
  inputSchema: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    linkedInUrl: z.string().optional(),
    currentRole: z.string().optional(),
    targetRole: z.string().optional(),
  }),
  outputSchema: z.object({ success: z.boolean() }),
  execute: async ({ input, context }) => {
    await Users.update({ id: context.user.id, record: input });
    return { success: true };
  },
});
