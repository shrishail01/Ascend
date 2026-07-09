import { z } from 'zod';
import { createEndpoint, CoverLetters } from 'zite-integrations-backend-sdk';
import { callGemini } from '../lib/gemini';

export default createEndpoint({
  authenticated: true,
  inputSchema: z.object({
    jobTitle: z.string(),
    company: z.string(),
    jobDescription: z.string(),
    resumeText: z.string().optional(),
    tone: z.string().optional(),
  }),
  outputSchema: z.object({ id: z.string(), content: z.string() }),
  execute: async ({ input, context }) => {
    const resumePart = input.resumeText ? `\n\nCandidate Resume:\n${input.resumeText}` : '';
    const prompt = `Write a professional cover letter for the following position:

Job Title: ${input.jobTitle}
Company: ${input.company}
Tone: ${input.tone || 'Professional'}

Job Description:
${input.jobDescription}${resumePart}

Write a compelling, personalized cover letter that:
- Addresses the specific role and company
- Highlights relevant experience and skills
- Shows enthusiasm for the role
- Is concise (3-4 paragraphs)
- Uses a ${input.tone || 'professional'} tone
- Does NOT include placeholder brackets like [Your Name]

Return ONLY the cover letter text, no extra formatting.`;

    const content = await callGemini(prompt, 'You are an expert career coach who writes compelling, personalized cover letters that get interviews.');
    
    const cl = await CoverLetters.create({
      record: {
        title: `${input.jobTitle} at ${input.company}`,
        user: context.user.id,
        company: input.company,
        jobTitle: input.jobTitle,
        content,
      },
    });

    return { id: cl.id, content };
  },
});
