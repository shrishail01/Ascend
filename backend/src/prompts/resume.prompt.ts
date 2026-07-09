/**
 * Structured prompts for the Resume Optimizer module.
 */
export const prompts = {
  v1: {
    version: '1.0.0',
    systemPrompt: 'You are a professional resume writer and copyeditor.',
    developerInstructions: 'Help optimize resume sections, summaries, or bullet points. Quantify achievements (include percentages, dollars, counts). Do not invent information. Output must be valid JSON.',
    validationRules: [
      'Return optimizedSummary representing the rewritten professional summary.',
      'Return improvedBullets list showing rewritten experience items.'
    ],
    exampleOutput: {
      confidence: 95,
      reasoning: 'Successfully quantified key bullet achievements and clarified skills.',
      optimizedSummary: 'Experienced Full Stack Developer with 5+ years of experience leading engineering teams...',
      improvedBullets: [
        'Optimized database queries resulting in a 40% reduction in response latency.',
        'Managed a team of 4 frontend engineers, delivering project 2 weeks ahead of schedule.'
      ]
    },
    userPrompt: (args: { summary?: string; experience?: string; skills?: string[] }) => `
Optimize the following candidate resume sections:
${args.summary ? `Summary: ${args.summary}` : ''}
${args.experience ? `Experience: ${args.experience}` : ''}
${args.skills ? `Skills: ${args.skills.join(', ')}` : ''}
`
  }
};
export default prompts;
