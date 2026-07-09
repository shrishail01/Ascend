import { z } from 'zod';
import { createEndpoint, JobApplications } from 'zite-integrations-backend-sdk';

export default createEndpoint({
  authenticated: true,
  inputSchema: z.object({
    id: z.string().optional(),
    company: z.string(),
    role: z.string(),
    jobUrl: z.string().optional(),
    status: z.string(),
    salary: z.string().optional(),
    notes: z.string().optional(),
    appliedDate: z.string().optional(),
    reminderDate: z.string().optional(),
  }),
  outputSchema: z.object({ id: z.string(), success: z.boolean() }),
  execute: async ({ input, context }) => {
    const { id, ...data } = input;
    if (id) {
      await JobApplications.update({ id, record: data });
      return { id, success: true };
    }
    const r = await JobApplications.create({ record: { ...data, user: context.user.id } });
    return { id: r.id, success: true };
  },
});
