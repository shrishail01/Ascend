import { z } from 'zod';
import { createEndpoint, Resumes, JobApplications, CoverLetters, InterviewSessions, AtsAnalyses } from 'zite-integrations-backend-sdk';

export default createEndpoint({
  authenticated: true,
  inputSchema: z.object({}),
  outputSchema: z.object({
    resumeCount: z.number(),
    avgAtsScore: z.number(),
    applicationCount: z.number(),
    applicationsByStatus: z.array(z.object({ status: z.string(), count: z.number() })),
    coverLetterCount: z.number(),
    interviewCount: z.number(),
    avgInterviewScore: z.number(),
    recentAnalyses: z.array(z.object({ id: z.string(), title: z.string().optional(), matchScore: z.number().optional(), createdAt: z.string().optional() })),
  }),
  execute: async ({ context }) => {
    const userId = context.user.id;
    const [resumes, apps, cls, interviews, analyses] = await Promise.all([
      Resumes.findAll({ filters: { user: userId } }),
      JobApplications.findAll({ filters: { user: userId } }),
      CoverLetters.findAll({ filters: { user: userId } }),
      InterviewSessions.findAll({ filters: { user: userId } }),
      AtsAnalyses.findAll({ filters: { user: userId }, limit: 5 }),
    ]);

    const avgAts = resumes.records.length > 0
      ? resumes.records.reduce((s, r) => s + (r.atsScore || 0), 0) / resumes.records.length
      : 0;

    const statusCounts: Record<string, number> = {};
    apps.records.forEach(a => { const s = a.status || 'Wishlist'; statusCounts[s] = (statusCounts[s] || 0) + 1; });

    const avgInterview = interviews.records.length > 0
      ? interviews.records.reduce((s, r) => s + (r.score || 0), 0) / interviews.records.length
      : 0;

    return {
      resumeCount: resumes.records.length,
      avgAtsScore: Math.round(avgAts),
      applicationCount: apps.records.length,
      applicationsByStatus: Object.entries(statusCounts).map(([status, count]) => ({ status, count })),
      coverLetterCount: cls.records.length,
      interviewCount: interviews.records.length,
      avgInterviewScore: Math.round(avgInterview),
      recentAnalyses: analyses.records.map(a => ({ id: a.id, title: a.title, matchScore: a.matchScore, createdAt: a.createdAt })),
    };
  },
});
