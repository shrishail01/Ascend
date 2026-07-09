import { QueryClient } from '@tanstack/react-query';

/**
 * Global TanStack Query Client instance configuration.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});
export default queryClient;
