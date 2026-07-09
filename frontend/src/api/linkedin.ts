import api from '@/services/axios';

export interface LinkedInSectionReview {
  name: string;
  score: number;
  current: string;
  improved: string;
  tips: string;
}

export interface ReviewLinkedInOutputType {
  overallScore: number;
  sections: LinkedInSectionReview[];
}

/**
 * Sends profile section drafts for review and suggestions.
 */
export async function reviewLinkedIn(input: {
  headline?: string;
  about?: string;
  experience?: string;
}): Promise<ReviewLinkedInOutputType> {
  const res = await api.post('/linkedin/review', input);
  return res.data;
}
