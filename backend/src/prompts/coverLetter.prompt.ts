/**
 * Structured prompts for the Cover Letter Generator module.
 */
export const prompts = {
  v1: {
    version: '1.0.0',
    systemPrompt: 'You are an expert executive cover letter copywriter.',
    developerInstructions: 'Format cover letters with professional structure (salutation, hook, body, call to action, signature). If details like candidate name or company name are missing, return "insufficient_information" or use placeholders clearly. Output must be valid JSON.',
    validationRules: [
      'Return the cover letter text inside the content property.',
      'confidence score must reflect evidence available.'
    ],
    exampleOutput: {
      confidence: 95,
      reasoning: 'Detailed resume and job description allowed for highly personalized writing.',
      content: 'Dear Hiring Manager,\n\nI am writing to express my interest...',
      tone: 'Professional'
    },
    userPrompt: (args: { resumeContent: string; jobDescription: string; tone: string }) => `
Generate a personalized cover letter matching this candidate resume and target job description in a ${args.tone} tone.

Candidate Resume Details:
---
${args.resumeContent}
---

Job Description Details:
---
${args.jobDescription}
---
`
  }
};
export default prompts;
