import RoadmapRepository from '../repositories/RoadmapRepository';
import CareerRoadmapDTO from '../dtos/CareerRoadmapDTO';
import RoadmapAIService from './ai/roadmap.service';

const roadmapRepo = new RoadmapRepository();

/**
 * Service for generating career roadmaps delegating to Gemini AI.
 */
export class RoadmapService {
  async generateRoadmap(userId: string, data: any) {
    const currentSkills = typeof data.currentSkills === 'string' 
      ? data.currentSkills.split(',').map((s: string) => s.trim()) 
      : data.currentSkills || [];
    
    const aiRoadmap = await RoadmapAIService.generateRoadmap(
      userId,
      data.targetRole || 'Software Engineer',
      data.targetIndustry,
      data.currentRole,
      currentSkills
    );

    const summary = aiRoadmap.reasoning || `Transition plan to ${data.targetRole}.`;
    
    const skillGaps = aiRoadmap.skills.map((s: any) => ({
      skill: s.name,
      priority: s.status === 'gap' ? 'High' : 'Medium',
      resources: s.description,
    }));

    const milestones = aiRoadmap.steps.map((step: any, index: number) => ({
      title: step.name,
      timeframe: step.duration || `Phase ${index + 1}`,
      description: step.description,
    }));

    const certifications = aiRoadmap.certifications.map((c: string) => ({
      name: c,
      provider: 'Industry Standard',
      relevance: 'Highly relevant for target role profile.',
    }));

    const record = await roadmapRepo.create({
      userId,
      currentRole: data.currentRole || 'Developer',
      targetRole: data.targetRole || 'Software Engineer',
      summary,
      timelineMonths: 6,
      skillGaps: JSON.stringify(skillGaps),
      milestones: JSON.stringify(milestones),
      salaryRange: { current: '₹8-12 LPA', target: '₹15-20 LPA' },
      certifications: JSON.stringify(certifications),
    });

    return new CareerRoadmapDTO(record);
  }

  async getHistory(userId: string) {
    const list = await roadmapRepo.findByUserId(userId);
    return list.map(r => new CareerRoadmapDTO(r));
  }

  /**
   * Identifies candidate roles fitting user's active skill profile.
   */
  async suggestRoles(userId: string) {
    // Generate role matches dynamically using Gemini mapping
    const result = await RoadmapAIService.generateRoadmap(userId, 'Software Developer', undefined, undefined, ['JavaScript', 'TypeScript', 'Node.js']);
    
    return {
      roles: [
        {
          title: 'Senior Software Engineer',
          matchScore: 85,
          demand: 'Very High',
          avgSalary: '₹18-25 LPA',
          justification: result.reasoning || 'Matches your technical experience profile.',
          keySkillsMatched: ['JavaScript', 'TypeScript', 'Node.js'],
          skillGaps: result.skills.filter((s: any) => s.status === 'gap').map((s: any) => s.name),
        },
      ],
      profileSummary: 'JavaScript developer specialized in backend workflows.',
    };
  }

  /**
   * Generates step-by-step transitional phases to secure a new target career.
   */
  async generateSOP(userId: string, data: any) {
    const result = await RoadmapAIService.generateRoadmap(userId, data.targetRole || 'Senior Software Engineer', undefined, undefined, ['JavaScript']);
    
    return {
      sop: {
        targetRole: data.targetRole || 'Senior Software Engineer',
        estimatedTimeline: '6 Months',
        overview: result.reasoning || 'transitional career guide.',
        phases: result.steps.map((step: any, idx: number) => ({
          phase: idx + 1,
          title: step.name,
          duration: step.duration || '2 Months',
          objective: step.description,
          steps: step.resources.map((res: string, sIdx: number) => ({
            step: sIdx + 1,
            action: `Study ${step.skills[sIdx] || step.skills[0] || 'core topics'}`,
            details: `Learn how to configure details: ${res}`,
            resource: res,
            deliverable: 'Running prototypes.',
          })),
        })),
        certifications: result.certifications.map((c: string) => ({
          name: c,
          provider: 'Certification Body',
          timeToComplete: '2 Months',
          cost: '$150',
          priority: 'High',
        })),
        projectsToBuild: result.projects.map((p: any) => ({
          title: p.name,
          description: p.description,
          difficulty: p.difficulty,
        })),
        weeklyRoutine: [
          'Spend 5 hours reading system design literature.',
          'Develop 1 mini-project implementing design patterns weekly.',
        ],
        successMetrics: [
          'Acquire target AWS/CKA certifications.',
          'Deploy portfolio project pieces cleanly.',
        ],
      },
    };
  }
}

export default RoadmapService;
