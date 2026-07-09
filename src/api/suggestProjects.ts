import { z } from 'zod';
import { createEndpoint } from 'zite-integrations-backend-sdk';
import { callGeminiJSON } from '../lib/gemini';

export default createEndpoint({
  authenticated: true,
  inputSchema: z.object({
    skills: z.string(),
    targetRole: z.string().optional(),
    level: z.string().optional(),
  }),
  outputSchema: z.object({
    projects: z.array(z.object({
      title: z.string(),
      description: z.string(),
      skills: z.array(z.string()),
      difficulty: z.string(),
      timeEstimate: z.string(),
      githubIdea: z.string(),
    })),
  }),
  execute: async ({ input }) => {
    const prompt = `Suggest 6 portfolio projects for someone with these skills: ${input.skills}
${input.targetRole ? `Target role: ${input.targetRole}` : ''}
${input.level ? `Level: ${input.level}` : ''}

Return JSON:
{
  "projects": [
    {
      "title": "Project Name",
      "description": "2-3 sentence description of what to build",
      "skills": ["skill1", "skill2"],
      "difficulty": "Beginner/Intermediate/Advanced",
      "timeEstimate": "2-3 weeks",
      "githubIdea": "How to structure the GitHub repo and README"
    }
  ]
}`;

    const result = await callGeminiJSON(prompt, 'You are a senior developer and career advisor. Suggest impressive, practical portfolio projects that demonstrate real skills to employers.');
    return result;
  },
});
