import { z } from 'zod';
import { createEndpoint, Users, Resumes, AtsAnalyses, CoverLetters, InterviewSessions } from 'zite-integrations-backend-sdk';

const FREE_LIMIT = 2;

type UsageCounts = Record<string, number>;

function parseUsage(raw?: string): UsageCounts {
  if (!raw) return {};
  try { return JSON.parse(raw); } catch { return {}; }
}

export default createEndpoint({
  authenticated: true,
  inputSchema: z.object({
    feature: z.string(),
    increment: z.boolean().optional(),
  }),
  outputSchema: z.object({
    allowed: z.boolean(),
    usageCount: z.number(),
    limit: z.number(),
    isPremium: z.boolean(),
  }),
  execute: async ({ input, context }) => {
    const plan = context.user.plan || 'Free';
    const isPremium = plan === 'Premium' || plan === 'Admin';

    if (isPremium) {
      // Premium users: always allowed, still track usage
      if (input.increment) {
        const usage = parseUsage(context.user.featureUsage);
        usage[input.feature] = (usage[input.feature] || 0) + 1;
        await Users.update({ id: context.user.id, record: { featureUsage: JSON.stringify(usage) } });
      }
      return { allowed: true, usageCount: 0, limit: 999, isPremium: true };
    }

    // For features backed by DB tables, count records
    let count = 0;
    const userId = context.user.id;

    switch (input.feature) {
      case 'resume': {
        const { records } = await Resumes.findAll({ filters: { user: userId }, limit: 10 });
        count = records.length;
        break;
      }
      case 'ats': {
        const { records } = await AtsAnalyses.findAll({ filters: { user: userId }, limit: 10 });
        count = records.length;
        break;
      }
      case 'coverLetter': {
        const { records } = await CoverLetters.findAll({ filters: { user: userId }, limit: 10 });
        count = records.length;
        break;
      }
      case 'interview': {
        const { records } = await InterviewSessions.findAll({ filters: { user: userId }, limit: 10 });
        count = records.length;
        break;
      }
      default: {
        // For features without a table (roadmap, linkedin, projects), use featureUsage JSON
        const usage = parseUsage(context.user.featureUsage);
        count = usage[input.feature] || 0;
        if (input.increment && count < FREE_LIMIT) {
          usage[input.feature] = count + 1;
          await Users.update({ id: context.user.id, record: { featureUsage: JSON.stringify(usage) } });
          count = count + 1;
        }
        break;
      }
    }

    return {
      allowed: count < FREE_LIMIT,
      usageCount: count,
      limit: FREE_LIMIT,
      isPremium: false,
    };
  },
});
