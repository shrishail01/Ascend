import api from '@/services/axios';

export interface GetJobApplicationsOutputType {
  applications: {
    id: string;
    company?: string;
    role?: string;
    jobUrl?: string;
    status?: string;
    salary?: string;
    notes?: string;
    appliedDate?: string;
    reminderDate?: string;
    createdAt?: string;
  }[];
}

/**
 * Fetch all job applications tracker logs.
 */
export async function getJobApplications(_input?: any): Promise<GetJobApplicationsOutputType> {
  const res = await api.get('/jobs');
  return { applications: res.data };
}

/**
 * Save or update a job application tracker log.
 */
export async function saveJobApplication(input: {
  id?: string;
  company: string;
  role: string;
  jobUrl?: string;
  status: string;
  salary?: string;
  notes?: string;
  appliedDate?: string;
  reminderDate?: string;
}): Promise<{ id: string; success: boolean }> {
  const res = await api.post('/jobs', input);
  return { id: res.data.id, success: true };
}

/**
 * Delete a job application log from the tracker.
 */
export async function deleteJobApplication(input: { id: string }): Promise<{ success: boolean }> {
  return api.delete(`/jobs/${input.id}`);
}
export default getJobApplications;
