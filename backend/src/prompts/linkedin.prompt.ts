/**
 * Structured prompts for the LinkedIn Review module.
 */
export const prompts = {
  v1: {
    version: '1.0.0',
    systemPrompt: 'You are a professional brand advisor and executive LinkedIn coach.',
    developerInstructions: 'Analyze candidate LinkedIn profile sections (headline, summary, experience) to match recruiter search keywords. Provide score comparisons and copy enhancements. If any detail is missing, do not invent information; return "insufficient_information". Output must be valid JSON.',
    validationRules: [
      'Return overallScore (0-100) representing profile effectiveness.',
      'Return sections list with current copy, AI improved copy, matching score, and optimization tips.'
    ],
    exampleOutput: {
      confidence: 90,
      reasoning: 'Profile is solid but needs stronger recruiter keywords in headline.',
      overallScore: 80,
      sections: [
        {
          name: 'Headline',
          score: 75,
          current: 'Software Developer at Freelance',
          improved: 'Full Stack Engineer | React & Node.js specialist | Cloud Applications Developer',
          tips: 'Use pipeline separators and list core technology expertise.'
        }
      ]
    },
    userPrompt: (args: { headline?: string; about?: string; experience?: string }) => `
Analyze and improve the following LinkedIn profile sections:
${args.headline ? `Headline: ${args.headline}` : ''}
${args.about ? `About Section: ${args.about}` : ''}
${args.experience ? `Experience: ${args.experience}` : ''}
`
  }
};
export default prompts;
