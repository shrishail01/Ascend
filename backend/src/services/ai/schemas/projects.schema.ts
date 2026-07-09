import { z } from 'zod';

export const projectsSchema = z.object({
  confidence: z.number().min(0).max(100),
  reasoning: z.string(),
  projects: z.array(z.object({
    name: z.string(),
    description: z.string(),
    difficulty: z.string(),
    techStack: z.array(z.string()),
    timeline: z.string(),
    learningGoals: z.array(z.string()),
    implementationSteps: z.array(z.string())
  })),
  metadata: z.object({
    model: z.string(),
    promptVersion: z.string(),
    generatedAt: z.string(),
    processingTime: z.number().optional()
  })
});

export default projectsSchema;
