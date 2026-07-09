import { z } from 'zod';
import { createEndpoint, Resumes } from 'zite-integrations-backend-sdk';

export default createEndpoint({
  authenticated: true,
  inputSchema: z.object({}),
  outputSchema: z.object({
    resumes: z.array(z.object({
      id: z.string(),
      title: z.string().optional(),
      template: z.string().optional(),
      atsScore: z.number().optional(),
      status: z.string().optional(),
      createdAt: z.string().optional(),
      updatedAt: z.string().optional(),
    })),
  }),
  execute: async ({ context }) => {
    const { records } = await Resumes.findAll({ filters: { user: context.user.id } });
    return { resumes: records.map(r => ({ id: r.id, title: r.title, template: r.template, atsScore: r.atsScore, status: r.status, createdAt: r.createdAt, updatedAt: r.updatedAt })) };
  },
});
