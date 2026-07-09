import api from '@/services/axios';

export interface GetDashboardStatsOutputType {
  resumeCount: number;
  avgAtsScore: number;
  applicationCount: number;
  applicationsByStatus: { status: string; count: number }[];
  coverLetterCount: number;
  interviewCount: number;
  avgInterviewScore: number;
  recentAnalyses: { id: string; title: string; matchScore: number; createdAt: string }[];
}

/**
 * Fetch platform user statistics summary.
 */
export async function getDashboardStats(_input?: any): Promise<GetDashboardStatsOutputType> {
  const res = await api.get('/dashboard/stats');
  return res.data;
}
export default getDashboardStats;
