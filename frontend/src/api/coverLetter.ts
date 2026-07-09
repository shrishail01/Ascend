import api from '@/services/axios';

export interface GetCoverLettersOutputType {
  coverLetters: {
    id: string;
    title?: string;
    company?: string;
    jobTitle?: string;
    content?: string;
    createdAt?: string;
  }[];
}

/**
 * Request cover letter generation based on company, job title and descriptions.
 */
export async function generateCoverLetter(input: {
  jobTitle: string;
  company: string;
  jobDescription: string;
  resumeText?: string;
  tone?: string;
}): Promise<{ id: string; content: string }> {
  const res = await api.post('/cover-letters/generate', {
    jobTitle: input.jobTitle,
    company: input.company,
    jd: input.jobDescription,
  });
  return res.data;
}

/**
 * Fetch saved cover letters list.
 */
export async function getCoverLetters(_input?: any): Promise<GetCoverLettersOutputType> {
  const res = await api.get('/cover-letters');
  return { coverLetters: res.data };
}

/**
 * Remove a cover letter from database.
 */
export async function deleteCoverLetter(input: { id: string }): Promise<{ success: boolean }> {
  return api.delete(`/cover-letters/${input.id}`);
}
