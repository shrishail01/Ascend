import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getResumes, saveResume, deleteResume } from '@/api/resume';
import { toast } from 'sonner';

/**
 * Hook managing resume collection state using TanStack Query.
 * Includes optimistic UI mutations with rollback cache logic.
 */
export function useResumes() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['resumes'],
    queryFn: () => getResumes({}).then(r => r.resumes),
  });

  const saveMutation = useMutation({
    mutationFn: saveResume,
    onMutate: async (newResume) => {
      await queryClient.cancelQueries({ queryKey: ['resumes'] });
      const previousResumes = queryClient.getQueryData<any[]>(['resumes']);

      if (previousResumes) {
        queryClient.setQueryData(
          ['resumes'],
          newResume.id 
            ? previousResumes.map(r => r.id === newResume.id ? { ...r, ...newResume } : r)
            : [...previousResumes, { id: 'optimistic-temp-id', ...newResume, createdAt: new Date().toISOString() }]
        );
      }

      return { previousResumes };
    },
    onError: (_err, _newResume, context) => {
      if (context?.previousResumes) {
        queryClient.setQueryData(['resumes'], context.previousResumes);
      }
      toast.error('Failed to save resume');
    },
    onSuccess: () => {
      toast.success('Resume saved successfully!');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteResume,
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: ['resumes'] });
      const previousResumes = queryClient.getQueryData<any[]>(['resumes']);

      if (previousResumes) {
        queryClient.setQueryData(
          ['resumes'],
          previousResumes.filter(r => r.id !== id)
        );
      }

      return { previousResumes };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousResumes) {
        queryClient.setQueryData(['resumes'], context.previousResumes);
      }
      toast.error('Failed to delete resume');
    },
    onSuccess: () => {
      toast.success('Resume deleted successfully!');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  return {
    resumes: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    saveResume: saveMutation.mutateAsync,
    deleteResume: deleteMutation.mutateAsync,
  };
}
export default useResumes;
