import api from '@/services/axios';

export interface SuggestRolesOutputType {
  roles: {
    title: string;
    matchScore: number;
    demand: string;
    avgSalary: string;
    justification: string;
    keySkillsMatched: string[];
    skillGaps: string[];
  }[];
  profileSummary: string;
}

export interface GenerateRoleSOPOutputType {
  sop: {
    targetRole: string;
    estimatedTimeline: string;
    overview: string;
    phases: {
      phase: number;
      title: string;
      duration: string;
      objective: string;
      steps: { step: number; action: string; details: string; resource: string; deliverable: string }[];
    }[];
    certifications: {
      name: string;
      provider: string;
      timeToComplete: string;
      cost: string;
      priority: string;
    }[];
    projectsToBuild: { title: string; description: string; difficulty: string }[];
    weeklyRoutine: string[];
    successMetrics: string[];
  };
}

export interface GenerateRoadmapOutputType {
  roadmap: {
    summary: string;
    timelineMonths: number;
    skillGaps: { skill: string; priority: string; resources: string }[];
    milestones: { title: string; timeframe: string; description: string }[];
    salaryRange: { current: string; target: string };
    certifications: { name: string; provider: string; relevance: string }[];
  };
}

export interface SuggestProjectsOutputType {
  projects: {
    title: string;
    description: string;
    skills: string[];
    difficulty: string;
    timeEstimate: string;
    githubIdea: string;
  }[];
}

/**
 * Fetch suggested role matches for user profile.
 */
export async function suggestRoles(_input?: any): Promise<SuggestRolesOutputType> {
  const res = await api.get('/roadmaps/suggest-roles');
  return res.data;
}

/**
 * Generate transitional Statement of Purpose phases list.
 */
export async function generateRoleSOP(input: {
  targetRole: string;
  matchScore?: number;
  skillGaps?: string[];
}): Promise<GenerateRoleSOPOutputType> {
  const res = await api.post('/roadmaps/sop', input);
  return res.data;
}

/**
 * Request customized roadmap path from database.
 */
export async function generateRoadmap(input: {
  currentRole: string;
  targetRole: string;
  skills?: string;
  experience?: string;
}): Promise<GenerateRoadmapOutputType> {
  const res = await api.post('/roadmaps/generate', input);
  return res.data;
}

/**
 * Request project suggestions matching specific skills criteria.
 */
export async function suggestProjects(input: {
  skills: string;
  targetRole?: string;
  level?: string;
}): Promise<SuggestProjectsOutputType> {
  const res = await api.post('/projects/suggest', input);
  return res.data;
}
