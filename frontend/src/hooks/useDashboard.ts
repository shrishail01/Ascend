import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '@/api/dashboard';

/**
 * Hook managing aggregated dashboard statistics.
 */
export function useDashboard() {
  const query = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => getDashboardStats({}),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  return {
    stats: query.data || null,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
export default useDashboard;
