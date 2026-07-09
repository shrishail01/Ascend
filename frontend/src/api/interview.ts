import api from '@/services/axios';

export interface GenerateInterviewQuestionsOutputType {
  id: string;
  questions: { id: string; question: string; tips?: string; sampleAnswer?: string }[];
}

export interface ScoreInterviewOutputType {
  overallScore: number;
  feedback: string;
  questionFeedback: {
    question: string;
    answer: string;
    score: number;
    strengths: string;
    improvements: string;
  }[];
}

/**
 * Initializes a new interview prep session.
 */
export async function generateInterviewQuestions(input: {
  jobTitle: string;
  company?: string;
  type: string;
}): Promise<GenerateInterviewQuestionsOutputType> {
  const res = await api.post('/interviews/start', input);
  return res.data;
}

/**
 * Submits user response answers for grading.
 */
export async function scoreInterview(input: {
  sessionId?: string;
  jobTitle?: string;
  company?: string;
  answers: { questionId: string; question: string; answer: string }[];
}): Promise<ScoreInterviewOutputType> {
  const res = await api.post('/interviews/score', input);
  return res.data;
}
export default generateInterviewQuestions;
