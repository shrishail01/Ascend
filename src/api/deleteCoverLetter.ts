import { z } from 'zod';
import { createEndpoint, CoverLetters } from 'zite-integrations-backend-sdk';

export default createEndpoint({
  authenticated: true,
  inputSchema: z.object({ id: z.string() }),
  outputSchema: z.object({ success: z.boolean() }),
  execute: async ({ input }) => {
    await CoverLetters.delete({ id: input.id });
    return { success: true };
  },
});
