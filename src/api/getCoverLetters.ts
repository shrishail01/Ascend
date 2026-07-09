import { z } from 'zod';
import { createEndpoint, CoverLetters } from 'zite-integrations-backend-sdk';

export default createEndpoint({
  authenticated: true,
  inputSchema: z.object({}),
  outputSchema: z.object({
    coverLetters: z.array(z.object({
      id: z.string(),
      title: z.string().optional(),
      company: z.string().optional(),
      jobTitle: z.string().optional(),
      content: z.string().optional(),
      createdAt: z.string().optional(),
    })),
  }),
  execute: async ({ context }) => {
    const { records } = await CoverLetters.findAll({ filters: { user: context.user.id } });
    return { coverLetters: records };
  },
});
