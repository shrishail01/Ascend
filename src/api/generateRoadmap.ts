import { z } from 'zod';
import { createEndpoint } from 'zite-integrations-backend-sdk';
import { callGeminiJSON } from '../lib/gemini';

export default createEndpoint({
  authenticated: true,
  inputSchema: z.object({
    currentRole: z.string(),
    targetRole: z.string(),
    skills: z.string().optional(),
    experience: z.string().optional(),
  }),
  outputSchema: z.object({
    roadmap: z.object({
      summary: z.string(),
      timelineMonths: z.number(),
      skillGaps: z.array(z.object({ skill: z.string(), priority: z.string(), resources: z.string() })),
      milestones: z.array(z.object({ title: z.string(), description: z.string(), timeframe: z.string() })),
      certifications: z.array(z.object({ name: z.string(), provider: z.string(), relevance: z.string() })),
      salaryRange: z.object({ current: z.string(), target: z.string() }),
    }),
  }),
  execute: async ({ input }) => {
    const prompt = `Create a career roadmap from "${input.currentRole}" to "${input.targetRole}".
${input.skills ? `Current skills: ${input.skills}` : ''}
${input.experience ? `Experience: ${input.experience}` : ''}

Return JSON:
{
  "summary": "2-3 sentence career transition summary",
  "timelineMonths": <estimated months>,
  "skillGaps": [{"skill": "...", "priority": "High/Medium/Low", "resources": "Where to learn this"}],
  "milestones": [{"title": "...", "description": "...", "timeframe": "Month 1-3"}],
  "certifications": [{"name": "...", "provider": "...", "relevance": "Why this cert matters"}],
  "salaryRange": {"current": "$X - $Y", "target": "$X - $Y"}
}`;

    const roadmap = await callGeminiJSON(prompt, 'You are a career advisor. Create realistic, actionable career roadmaps with specific timelines and resources.');
    return { roadmap };
  },
});
