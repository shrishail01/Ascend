import { z } from 'zod';
import { createEndpoint, InterviewSessions } from 'zite-integrations-backend-sdk';
import { callGeminiJSON } from '../lib/gemini';

export default createEndpoint({
  authenticated: true,
  inputSchema: z.object({
    sessionId: z.string(),
    answers: z.array(z.object({
      question: z.string(),
      answer: z.string(),
    })),
  }),
  outputSchema: z.object({
    overallScore: z.number(),
    feedback: z.string(),
    questionFeedback: z.array(z.object({
      score: z.number(),
      strengths: z.string(),
      improvements: z.string(),
    })),
  }),
  execute: async ({ input }) => {
    const prompt = `Score these interview answers on a scale of 0-100. For each answer provide specific feedback.

Questions and Answers:
${input.answers.map((a, i) => `Q${i + 1}: ${a.question}\nA${i + 1}: ${a.answer}`).join('\n\n')}

Return JSON:
{
  "overallScore": <0-100>,
  "feedback": "Overall assessment paragraph",
  "questionFeedback": [
    {"score": <0-100>, "strengths": "What was good", "improvements": "What to improve"}
  ]
}`;

    const result = await callGeminiJSON(prompt, 'You are an expert interview coach. Provide constructive, actionable feedback on interview answers.');

    await InterviewSessions.update({
      id: input.sessionId,
      record: { score: result.overallScore, feedback: result.feedback },
    });

    return result;
  },
});
