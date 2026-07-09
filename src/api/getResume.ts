import { z } from 'zod';
import { createEndpoint, Resumes } from 'zite-integrations-backend-sdk';

export default createEndpoint({
  authenticated: true,
  inputSchema: z.object({ id: z.string() }),
  outputSchema: z.object({
    resume: z.object({
      id: z.string(),
      title: z.string().optional(),
      template: z.string().optional(),
      content: z.string().optional(),
      atsScore: z.number().optional(),
      status: z.string().optional(),
      createdAt: z.string().optional(),
      updatedAt: z.string().optional(),
    }).nullable(),
  }),
  execute: async ({ input }) => {
    const r = await Resumes.findOne({ id: input.id });
    if (!r) return { resume: null };
    return { resume: { id: r.id, title: r.title, template: r.template, content: r.content, atsScore: r.atsScore, status: r.status, createdAt: r.createdAt, updatedAt: r.updatedAt } };
  },
});
