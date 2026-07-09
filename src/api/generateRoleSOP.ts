import { z } from 'zod';
import { createEndpoint, Resumes, AtsAnalyses } from 'zite-integrations-backend-sdk';
import { callGeminiJSON } from '../lib/gemini';

export default createEndpoint({
  authenticated: true,
  inputSchema: z.object({
    targetRole: z.string(),
    matchScore: z.number().optional(),
    skillGaps: z.array(z.string()).optional(),
  }),
  outputSchema: z.object({
    sop: z.object({
      targetRole: z.string(),
      estimatedTimeline: z.string(),
      overview: z.string(),
      phases: z.array(z.object({
        phase: z.number(),
        title: z.string(),
        duration: z.string(),
        objective: z.string(),
        steps: z.array(z.object({
          step: z.number(),
          action: z.string(),
          details: z.string(),
          resource: z.string(),
          deliverable: z.string(),
        })),
      })),
      certifications: z.array(z.object({
        name: z.string(),
        provider: z.string(),
        cost: z.string(),
        timeToComplete: z.string(),
        priority: z.string(),
      })),
      weeklyRoutine: z.array(z.string()),
      successMetrics: z.array(z.string()),
    }),
  }),
  execute: async ({ input, context }) => {
    const user = context.user;
    let resumeText = '';

    const { records: resumes } = await Resumes.findAll({
      filters: { user: user.id },
      limit: 1,
    });
    if (resumes.length > 0 && resumes[0].content) {
      resumeText = resumes[0].content;
    }
    if (!resumeText) {
      const { records: analyses } = await AtsAnalyses.findAll({
        filters: { user: user.id },
        limit: 1,
      });
      if (analyses.length > 0 && analyses[0].resumeText) {
        resumeText = analyses[0].resumeText;
      }
    }

    const profileCtx = [
      user.currentRole ? `Current Role: ${user.currentRole}` : '',
      resumeText ? `Resume:\n${resumeText.slice(0, 5000)}` : '',
      input.skillGaps?.length ? `Known Skill Gaps: ${input.skillGaps.join(', ')}` : '',
    ].filter(Boolean).join('\n');

    const prompt = `Create a detailed, actionable Step-by-Step SOP (Standard Operating Procedure) for transitioning to "${input.targetRole}" from the current situation.

${profileCtx}

This SOP must be so detailed and practical that if the candidate follows EVERY single step, they WILL become job-ready for this role.

Return JSON:
{
  "targetRole": "${input.targetRole}",
  "estimatedTimeline": "e.g. 4-6 months",
  "overview": "2-3 sentence overview of the transition plan",
  "phases": [
    {
      "phase": 1,
      "title": "Foundation Building",
      "duration": "Month 1-2",
      "objective": "What this phase achieves",
      "steps": [
        {
          "step": 1,
          "action": "Short action title",
          "details": "Specific instructions on what to do",
          "resource": "Specific course/book/platform with name",
          "deliverable": "What you should have completed"
        }
      ]
    }
  ],
  "certifications": [
    {
      "name": "Cert name",
      "provider": "Provider",
      "cost": "$X or Free",
      "timeToComplete": "X weeks",
      "priority": "Must-have/Recommended/Nice-to-have"
    }
  ],
  "weeklyRoutine": ["Daily: 1 hour of X", "3x/week: Practice Y", "Weekly: Network with Z"],
  "successMetrics": ["Can do X", "Built Y portfolio projects", "Passed Z certification"]
}

Include 3-5 phases with 3-5 actionable steps each. Be specific with resources — name actual courses, books, platforms.`;

    const sop = await callGeminiJSON(prompt, 'You are an elite career coach who creates detailed, no-fluff action plans. Every recommendation must be specific, practical, and include real resources. No vague advice.');
    return { sop };
  },
});
