import { z } from 'zod';
import { createEndpoint, JobApplications } from 'zite-integrations-backend-sdk';

export default createEndpoint({
  authenticated: true,
  inputSchema: z.object({}),
  outputSchema: z.object({
    applications: z.array(z.object({
      id: z.string(),
      company: z.string().optional(),
      role: z.string().optional(),
      jobUrl: z.string().optional(),
      status: z.string().optional(),
      salary: z.string().optional(),
      notes: z.string().optional(),
      appliedDate: z.string().optional(),
      reminderDate: z.string().optional(),
      createdAt: z.string().optional(),
    })),
  }),
  execute: async ({ context }) => {
    const { records } = await JobApplications.findAll({ filters: { user: context.user.id } });
    return { applications: records };
  },
});
