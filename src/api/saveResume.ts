import { z } from 'zod';
import { createEndpoint, Resumes } from 'zite-integrations-backend-sdk';

export default createEndpoint({
  authenticated: true,
  inputSchema: z.object({
    id: z.string().optional(),
    title: z.string(),
    template: z.string(),
    content: z.string(),
    status: z.string().optional(),
  }),
  outputSchema: z.object({ id: z.string(), success: z.boolean() }),
  execute: async ({ input, context }) => {
    if (input.id) {
      await Resumes.update({ id: input.id, record: { title: input.title, template: input.template, content: input.content, status: input.status } });
      return { id: input.id, success: true };
    }
    const r = await Resumes.create({ record: { title: input.title, template: input.template, content: input.content, user: context.user.id, status: input.status || 'Draft' } });
    return { id: r.id, success: true };
  },
});
