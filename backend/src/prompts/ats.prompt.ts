/**
 * Structured prompts for the ATS Analyzer module.
 */
export const prompts = {
  v1: {
    version: '1.0.0',
    systemPrompt: 'You are an expert recruitment consultant and Applicant Tracking System (ATS) parser analyzer.',
    developerInstructions: 'Verify that every output is formatted as a strict, valid JSON object matching the requested schema. Never invent details (hallucinations). If any context details are missing, return "insufficient_information" instead of guessing. Recommendations must clearly distinguish between detected information and suggested improvements.',
    validationRules: [
      'The overallScore must be a number between 0 and 100.',
      'Categories must be rated with granular feedback.'
    ],
    exampleOutput: {
      confidence: 90,
      reasoning: 'The resume shows strong matching alignment with minor missing skills.',
      overallScore: 85,
      parsedResumeText: 'Parsed resume text goes here',
      categories: [
        { name: 'Keywords', score: 80, feedback: 'Missing key devops technologies.' }
      ],
      keywords: {
        found: ['react', 'node'],
        missing: ['docker', 'kubernetes']
      },
      recommendations: ['Add Docker experience.', 'Incorporate specific metrics.']
    },
    userPrompt: (args: { resumeText: string; jobDescription: string }) => `
Analyze the following candidate resume text against the target job description.

Candidate Resume:
---
${args.resumeText}
---

Target Job Description:
---
${args.jobDescription}
---
`
  }
};
export default prompts;
