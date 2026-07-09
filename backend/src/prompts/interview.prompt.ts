/**
 * Structured prompts for the Interview Prep module.
 */
export const prompts = {
  v1: {
    version: '1.0.0',
    systemPrompt: 'You are an elite technical interviewer and recruiter coach.',
    developerInstructions: 'Generate relevant HR, technical, coding, or behavioral questions. For scoring, evaluate answers against STAR format (Situation, Task, Action, Result). Highlight strengths and improvements. Output must be valid JSON.',
    validationRules: [
      'For generating questions, return questions array with id, question, tips, sampleAnswer.',
      'For scoring, evaluate each response, calculate overallScore (0-100), and write detailed questionFeedback.'
    ],
    exampleQuestionsOutput: {
      id: 'session-id-123',
      questions: [
        { id: 'q-1', question: 'Explain React virtual DOM.', tips: 'Mention reconciliation.', sampleAnswer: 'Virtual DOM is a lightweight copy of...' }
      ]
    },
    exampleScoreOutput: {
      confidence: 90,
      reasoning: 'The candidate gave detailed answers but lacked quantifiable metrics.',
      overallScore: 78,
      feedback: 'Good technical clarity; structure projects using the STAR method.',
      questionFeedback: [
        {
          question: 'Explain React virtual DOM.',
          answer: 'It is a copy of the DOM.',
          score: 70,
          strengths: 'Understands basic concept.',
          improvements: 'Explain reconciliation process.'
        }
      ]
    },
    userGeneratePrompt: (args: { jobTitle: string; company?: string; type: string }) => `
Generate a list of 5 interview questions for a ${args.jobTitle} position ${args.company ? `at ${args.company}` : ''}.
Interview Type: ${args.type}
`,
    userScorePrompt: (args: { answers: { question: string; answer: string }[] }) => `
Score the candidate responses.
Responses to score:
${JSON.stringify(args.answers, null, 2)}
`
  }
};
export default prompts;
