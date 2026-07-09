/**
 * Structured prompts for the Project Generator module.
 */
export const prompts = {
  v1: {
    version: '1.0.0',
    systemPrompt: 'You are a Senior Project Architect and engineering advisor.',
    developerInstructions: 'Generate portfolio-worthy project suggestions tailored to a target role. Define difficulty, tech stack, learning goals, timeline, and step-by-step implementation. Output must be valid JSON.',
    validationRules: [
      'Return projects array with name, description, difficulty, techStack, timeline, learningGoals, implementationSteps.'
    ],
    exampleOutput: {
      confidence: 90,
      reasoning: 'Tailored 2 relevant projects matching the specified modern technologies.',
      projects: [
        {
          name: 'Distributed Task Queue',
          description: 'A reliable task processing system with Redis backend.',
          difficulty: 'Intermediate',
          techStack: ['Node.js', 'Redis', 'TypeScript'],
          timeline: '2 weeks',
          learningGoals: ['Understand asynchronous message patterns.', 'Concurrency controls.'],
          implementationSteps: ['Initialize backend project.', 'Set up Redis message listener.', 'Add retry policies.']
        }
      ]
    },
    userPrompt: (args: { role: string; limit?: number }) => `
Generate ${args.limit || 2} tailored portfolio project suggestions for a candidate seeking a ${args.role} position.
`
  }
};
export default prompts;
