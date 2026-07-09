import { z } from 'zod';
import { createEndpoint, InterviewSessions } from 'zite-integrations-backend-sdk';
import { callGeminiJSON } from '../lib/gemini';

export default createEndpoint({
  authenticated: true,
  inputSchema: z.object({
    jobTitle: z.string(),
    company: z.string().optional(),
    type: z.enum(['hr', 'technical', 'behavioral']),
  }),
  outputSchema: z.object({
    id: z.string(),
    questions: z.array(z.object({
      question: z.string(),
      tips: z.string(),
      sampleAnswer: z.string(),
    })),
  }),
  execute: async ({ input, context }) => {
    const typeLabel = input.type === 'hr' ? 'HR/General' : input.type === 'technical' ? 'Technical' : 'Behavioral';
    const prompt = `Generate 8 ${typeLabel} interview questions for a ${input.jobTitle} position${input.company ? ` at ${input.company}` : ''}.

Return JSON array:
{
  "questions": [
    {
      "question": "...",
      "tips": "Key points to cover in your answer",
      "sampleAnswer": "A strong sample answer using STAR method where applicable (2-3 paragraphs)"
    }
  ]
}`;

    const result = await callGeminiJSON(prompt, 'You are an expert interview coach. Generate realistic, role-specific interview questions with actionable tips and strong sample answers.');

    const session = await InterviewSessions.create({
      record: {
        title: `${typeLabel} - ${input.jobTitle}`,
        user: context.user.id,
        jobTitle: input.jobTitle,
        company: input.company,
        type: typeLabel as any,
        questionsData: JSON.stringify(result.questions),
      },
    });

    return { id: session.id, questions: result.questions };
  },
});
