import { z } from 'zod';
import { createEndpoint } from 'zite-integrations-backend-sdk';
import { callGeminiJSON } from '../lib/gemini';

export default createEndpoint({
  authenticated: true,
  inputSchema: z.object({
    headline: z.string().optional(),
    about: z.string().optional(),
    experience: z.string().optional(),
  }),
  outputSchema: z.object({
    overallScore: z.number(),
    sections: z.array(z.object({
      name: z.string(),
      score: z.number(),
      current: z.string(),
      improved: z.string(),
      tips: z.string(),
    })),
  }),
  execute: async ({ input }) => {
    const prompt = `Review and optimize this LinkedIn profile:

${input.headline ? `Headline: ${input.headline}` : ''}
${input.about ? `About: ${input.about}` : ''}
${input.experience ? `Experience: ${input.experience}` : ''}

Return JSON:
{
  "overallScore": <0-100>,
  "sections": [
    {"name": "Headline", "score": <0-100>, "current": "current text", "improved": "optimized version", "tips": "specific tips"},
    {"name": "About", "score": <0-100>, "current": "current text", "improved": "optimized version", "tips": "specific tips"},
    {"name": "Experience", "score": <0-100>, "current": "current text", "improved": "optimized version", "tips": "specific tips"}
  ]
}`;

    const result = await callGeminiJSON(prompt, 'You are a LinkedIn optimization expert. Provide specific, actionable improvements with keyword optimization.');
    return result;
  },
});
