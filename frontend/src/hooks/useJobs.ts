import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getJobApplications, saveJobApplication, deleteJobApplication } from '@/api/jobs';
import { toast } from 'sonner';

/**
 * Hook managing job tracker pipeline list state using TanStack Query.
 * Includes optimistic UI mutations with rollback cache logic.
 */
export function useJobs() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['jobs'],
    queryFn: () => getJobApplications({}).then(r => r.applications),
  });

  const saveMutation = useMutation({
    mutationFn: saveJobApplication,
    onMutate: async (newJob) => {
      await queryClient.cancelQueries({ queryKey: ['jobs'] });
      const previousJobs = queryClient.getQueryData<any[]>(['jobs']);

      if (previousJobs) {
        queryClient.setQueryData(
          ['jobs'],
          newJob.id 
            ? previousJobs.map(j => j.id === newJob.id ? { ...j, ...newJob } : j)
            : [...previousJobs, { id: 'optimistic-job-id', ...newJob, createdAt: new Date().toISOString() }]
        );
      }

      return { previousJobs };
    },
    onError: (_err, _newJob, context) => {
      if (context?.previousJobs) {
        queryClient.setQueryData(['jobs'], context.previousJobs);
      }
      toast.error('Failed to save job application');
    },
    onSuccess: () => {
      toast.success('Job application saved successfully!');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteJobApplication,
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: ['jobs'] });
      const previousJobs = queryClient.getQueryData<any[]>(['jobs']);

      if (previousJobs) {
        queryClient.setQueryData(
          ['jobs'],
          previousJobs.filter(j => j.id !== id)
        );
      }

      return { previousJobs };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousJobs) {
        queryClient.setQueryData(['jobs'], context.previousJobs);
      }
      toast.error('Failed to delete job application');
    },
    onSuccess: () => {
      toast.success('Job application deleted successfully!');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  return {
    jobs: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    saveJob: saveMutation.mutateAsync,
    deleteJob: deleteMutation.mutateAsync,
  };
}
export default useJobs;
