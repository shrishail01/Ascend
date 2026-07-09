import api from '@/services/axios';

export interface AnalyzeATSOutputType {
  id: string;
  overallScore: number;
  parsedResumeText: string;
  categories: {
    name: string;
    score: number;
    feedback: string;
  }[];
  keywords: {
    found: string[];
    missing: string[];
  };
  recommendations: string[];
}

export interface OptimizeResumeATSOutputType {
  optimizedText: string;
  pdfUrl: string;
  sections: {
    fullName: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    linkedIn: string;
    summary: string;
    experience: {
      jobTitle: string;
      company: string;
      duration: string;
      bullets: string[];
    }[];
    education: {
      degree: string;
      institution: string;
      year: string;
    }[];
    skills: string[];
    certifications: string[];
    projects: {
      name: string;
      description: string;
    }[];
  };
}

/**
 * Trigger ATS resume scan against job descriptions.
 */
export async function analyzeATS(input: {
  resumeText?: string;
  fileUrl?: string;
  fileName?: string;
  jobDescription?: string;
}): Promise<AnalyzeATSOutputType> {
  const res = await api.post('/ats/analyze', {
    resumeText: input.resumeText,
    jd: input.jobDescription,
  });
  return res.data;
}

/**
 * Trigger simulated resume optimization.
 */
export async function optimizeResumeATS(input: {
  resumeText: string;
  jobDescription?: string;
}): Promise<OptimizeResumeATSOutputType> {
  const res = await api.post('/ats/optimize', {
    resumeText: input.resumeText,
    jd: input.jobDescription,
  });
  return res.data;
}

/**
 * Optimize specific experience description bullet points.
 */
export async function optimizeResume(input: {
  bulletPoints: string[];
  targetRole?: string;
  industry?: string;
}): Promise<{ optimized: { original: string; improved: string; changes: string }[] }> {
  const res = await api.post('/ats/optimize-bullets', input);
  return res.data;
}
