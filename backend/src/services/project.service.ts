import ProjectsRepository from '../repositories/ProjectsRepository';
import ProjectDTO from '../dtos/ProjectDTO';
import ProjectAIService from './ai/project.service';

const projectsRepo = new ProjectsRepository();

/**
 * Service for portfolio project recommendations delegating to Gemini AI.
 */
export class ProjectService {
  async suggestProjects(userId: string, data: any) {
    const aiResult = await ProjectAIService.generateProjects(
      userId,
      data.role || 'Software Engineer',
      data.limit || 2
    );

    const results = [];
    for (const p of aiResult.projects) {
      const record = await projectsRepo.create({
        userId,
        title: p.name,
        description: p.description,
        skills: p.techStack,
        difficulty: p.difficulty || data.level || 'Intermediate',
        timeEstimate: p.timeline || '2 weeks',
        githubIdea: p.learningGoals.join(', '),
      });
      results.push(new ProjectDTO(record));
    }

    return { projects: results };
  }

  async getHistory(userId: string) {
    const list = await projectsRepo.findByUserId(userId);
    return list.map(p => new ProjectDTO(p));
  }
}

export default ProjectService;
