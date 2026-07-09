import { z } from 'zod';
import { createEndpoint, JobApplications } from 'zite-integrations-backend-sdk';

export default createEndpoint({
  authenticated: true,
  inputSchema: z.object({ id: z.string() }),
  outputSchema: z.object({ success: z.boolean() }),
  execute: async ({ input }) => {
    await JobApplications.delete({ id: input.id });
    return { success: true };
  },
});
