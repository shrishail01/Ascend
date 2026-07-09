import api from '@/services/axios';

export interface ResumeDetail {
  id: string;
  title?: string;
  template?: string;
  content?: string;
  atsScore?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  versions?: { versionId: string; title: string; content: string; createdAt: string }[];
}

export interface GetResumesOutputType {
  resumes: {
    id: string;
    title?: string;
    template?: string;
    atsScore?: number;
    status?: string;
    createdAt?: string;
    updatedAt?: string;
  }[];
}

/**
 * Fetch details of a single resume from the database.
 */
export async function getResume(input: { id: string }): Promise<{ resume: ResumeDetail | null }> {
  const res = await api.get(`/resumes/${input.id}`);
  return { resume: res.data };
}

/**
 * Fetch all active resumes created by the user.
 */
export async function getResumes(_input?: any): Promise<GetResumesOutputType> {
  const res = await api.get('/resumes');
  return { resumes: res.data };
}

/**
 * Save or update resume structure.
 */
export async function saveResume(input: {
  id?: string;
  title: string;
  template: string;
  content: string;
  status?: string;
}): Promise<{ id: string; success: boolean }> {
  const res = await api.post('/resumes', input);
  return { id: res.data.id, success: true };
}

/**
 * Soft delete a resume.
 */
export async function deleteResume(input: { id: string }): Promise<{ success: boolean }> {
  await api.delete(`/resumes/${input.id}`);
  return { success: true };
}

/**
 * Duplicate an existing resume to a copy.
 */
export async function duplicateResume(input: { id: string }): Promise<{ id: string; success: boolean }> {
  const res = await api.post(`/resumes/${input.id}/duplicate`);
  return { id: res.data.id, success: true };
}

/**
 * Expose download endpoint URL path.
 */
export async function exportResumePdf(input: { id: string }): Promise<{ url: string }> {
  return { url: `/api/v1/resumes/${input.id}/pdf` };
}
