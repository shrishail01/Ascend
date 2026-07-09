import { z } from 'zod';
import { createEndpoint } from 'zite-integrations-backend-sdk';
import { callGeminiJSON } from '../lib/gemini';

export default createEndpoint({
  authenticated: true,
  inputSchema: z.object({
    bulletPoints: z.array(z.string()),
    targetRole: z.string().optional(),
    industry: z.string().optional(),
  }),
  outputSchema: z.object({
    optimized: z.array(z.object({
      original: z.string(),
      improved: z.string(),
      changes: z.string(),
    })),
  }),
  execute: async ({ input }) => {
    const prompt = `Optimize these resume bullet points for maximum ATS compatibility and impact.
${input.targetRole ? `Target Role: ${input.targetRole}` : ''}
${input.industry ? `Industry: ${input.industry}` : ''}

Bullet points:
${input.bulletPoints.map((b, i) => `${i + 1}. ${b}`).join('\n')}

For each bullet point:
- Add measurable metrics/numbers where possible
- Start with strong action verbs
- Improve for ATS keyword optimization
- Make achievements quantifiable

Return JSON:
{
  "optimized": [
    {"original": "...", "improved": "...", "changes": "Brief explanation of what was improved"}
  ]
}`;

    const result = await callGeminiJSON(prompt, 'You are an expert resume writer. Optimize bullet points for ATS systems with quantifiable achievements and strong action verbs.');
    return result;
  },
});
