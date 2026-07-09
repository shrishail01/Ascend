/**
 * Structured prompts for the Career Roadmap module.
 */
export const prompts = {
  v1: {
    version: '1.0.0',
    systemPrompt: 'You are a veteran technical career mentor and tech lead.',
    developerInstructions: 'Generate a career transition learning roadmap. Define skill gaps, learning steps, milestones, courses, certifications, and portfolio projects. If data is insufficient, return "insufficient_information". Output must be valid JSON.',
    validationRules: [
      'Return steps list containing name, description, duration, skills, and resources.',
      'Return skills list with status of matched, gap, or recommended.'
    ],
    exampleOutput: {
      confidence: 90,
      reasoning: 'Clear transition path mapped out from current skills to target role.',
      steps: [
        {
          name: 'Learn backend foundations',
          description: 'Study Node.js, Express, databases.',
          duration: '4 weeks',
          skills: ['Node.js', 'Express', 'MongoDB'],
          resources: ['MDN Node guides', 'Node.js official docs']
        }
      ],
      skills: [
        { name: 'JavaScript', status: 'matched', description: 'Strong core knowledge.' },
        { name: 'MongoDB', status: 'gap', description: 'Need database query foundations.' }
      ],
      certifications: ['AWS Certified Developer'],
      projects: [
        { name: 'REST API Service', description: 'Build a CRUD app.', difficulty: 'Beginner', techStack: ['Node.js', 'Express'] }
      ]
    },
    userPrompt: (args: { targetRole: string; targetIndustry?: string; currentRole?: string; currentSkills?: string[] }) => `
Generate a career learning roadmap for a candidate transitioning to the role of ${args.targetRole} ${args.targetIndustry ? `in the ${args.targetIndustry} industry` : ''}.
Current Role: ${args.currentRole || 'Not specified'}
Current Skills: ${args.currentSkills ? args.currentSkills.join(', ') : 'None specified'}
`
  }
};
export default prompts;
