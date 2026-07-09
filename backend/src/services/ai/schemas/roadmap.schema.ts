import { z } from 'zod';

export const roadmapSchema = z.object({
  confidence: z.number().min(0).max(100),
  reasoning: z.string(),
  steps: z.array(z.object({
    name: z.string(),
    description: z.string(),
    duration: z.string(),
    skills: z.array(z.string()),
    resources: z.array(z.string())
  })),
  skills: z.array(z.object({
    name: z.string(),
    status: z.enum(['matched', 'gap', 'recommended']),
    description: z.string()
  })),
  certifications: z.array(z.string()),
  projects: z.array(z.object({
    name: z.string(),
    description: z.string(),
    difficulty: z.string(),
    techStack: z.array(z.string())
  })),
  metadata: z.object({
    model: z.string(),
    promptVersion: z.string(),
    generatedAt: z.string(),
    processingTime: z.number().optional()
  })
});

export default roadmapSchema;
