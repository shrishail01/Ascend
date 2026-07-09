import { z } from 'zod';

export const atsAnalysisSchema = z.object({
  confidence: z.number().min(0).max(100),
  reasoning: z.string(),
  overallScore: z.number().min(0).max(100),
  parsedResumeText: z.string(),
  categories: z.array(z.object({
    name: z.string(),
    score: z.number().min(0).max(100),
    feedback: z.string()
  })),
  keywords: z.object({
    found: z.array(z.string()),
    missing: z.array(z.string())
  }),
  recommendations: z.array(z.string()),
  metadata: z.object({
    model: z.string(),
    promptVersion: z.string(),
    generatedAt: z.string(),
    processingTime: z.number().optional()
  })
});

export const atsOptimizeSchema = z.object({
  confidence: z.number().min(0).max(100),
  reasoning: z.string(),
  optimizedText: z.string(),
  pdfUrl: z.string(),
  sections: z.object({
    fullName: z.string(),
    title: z.string(),
    email: z.string(),
    phone: z.string(),
    location: z.string(),
    linkedIn: z.string(),
    summary: z.string(),
    experience: z.array(z.object({
      jobTitle: z.string(),
      company: z.string(),
      duration: z.string(),
      bullets: z.array(z.string())
    })),
    education: z.array(z.object({
      degree: z.string(),
      institution: z.string(),
      year: z.string()
    })),
    skills: z.array(z.string()),
    certifications: z.array(z.string()),
    projects: z.array(z.object({
      name: z.string(),
      description: z.string()
    }))
  }),
  metadata: z.object({
    model: z.string(),
    promptVersion: z.string(),
    generatedAt: z.string(),
    processingTime: z.number().optional()
  })
});
