import { z } from 'zod';
import { createEndpoint, Resumes, AtsAnalyses } from 'zite-integrations-backend-sdk';
import { callGeminiJSON } from '../lib/gemini';

export default createEndpoint({
  authenticated: true,
  inputSchema: z.object({}),
  outputSchema: z.object({
    roles: z.array(z.object({
      title: z.string(),
      matchScore: z.number(),
      demand: z.string(),
      avgSalary: z.string(),
      justification: z.string(),
      keySkillsMatched: z.array(z.string()),
      skillGaps: z.array(z.string()),
    })),
    profileSummary: z.string(),
  }),
  execute: async ({ context }) => {
    // Gather user profile data
    const user = context.user;
    let resumeText = '';

    // Try to get latest resume content
    const { records: resumes } = await Resumes.findAll({
      filters: { user: user.id },
      limit: 1,
    });
    if (resumes.length > 0 && resumes[0].content) {
      resumeText = resumes[0].content;
    }

    // Try latest ATS analysis for parsed resume text
    if (!resumeText) {
      const { records: analyses } = await AtsAnalyses.findAll({
        filters: { user: user.id },
        limit: 1,
      });
      if (analyses.length > 0 && analyses[0].resumeText) {
        resumeText = analyses[0].resumeText;
      }
    }

    const profileInfo = [
      user.currentRole ? `Current Role: ${user.currentRole}` : '',
      user.targetRole ? `Target Role Interest: ${user.targetRole}` : '',
      resumeText ? `Resume:\n${resumeText.slice(0, 6000)}` : '',
    ].filter(Boolean).join('\n');

    if (!profileInfo.trim()) {
      throw new Error('No profile data found. Please update your profile or upload a resume first.');
    }

    const prompt = `Based on this professional profile, suggest the TOP 5 most in-demand job ROLES (not specific jobs) in 2025-2026 that closely match this person's skills and experience.

${profileInfo}

Consider:
- Current market demand and growth trends
- How well the person's existing skills transfer
- Realistic transition feasibility
- Salary potential and career growth

Return JSON:
{
  "profileSummary": "1-2 sentence summary of the candidate's profile",
  "roles": [
    {
      "title": "Role Title (e.g. Senior Product Manager, Data Engineer)",
      "matchScore": 85,
      "demand": "High/Very High/Medium",
      "avgSalary": "$120K - $160K",
      "justification": "2-3 sentences on why this role fits",
      "keySkillsMatched": ["Skill 1", "Skill 2", "Skill 3"],
      "skillGaps": ["Gap 1", "Gap 2"]
    }
  ]
}

Sort by matchScore descending. Be realistic with scores.`;

    const result = await callGeminiJSON(prompt, 'You are a career strategist with deep knowledge of current job market trends, in-demand roles, and career transitions. Provide realistic, data-informed recommendations.');
    return result;
  },
});
