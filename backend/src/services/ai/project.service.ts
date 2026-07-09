import AIGateway from './gateway.service';
import ContextBuilderService from './contextBuilder.service';
import prompts from '../../prompts/projects.prompt';
import { projectsSchema } from './schemas/projects.schema';

/**
 * Service managing Portfolio Project recommendations delegating calls to AIGateway.
 */
export class ProjectAIService {
  static async generateProjects(userId: string, role: string, limit?: number): Promise<any> {
    const promptDef = prompts.v1;
    const cleanRole = ContextBuilderService.cleanContext(role, 100);

    const fullPrompt = promptDef.userPrompt({ role: cleanRole, limit });

    return await AIGateway.request(fullPrompt, {
      userId,
      featureName: 'projects',
      promptVersion: promptDef.version,
      zodSchema: projectsSchema,
      systemInstruction: `${promptDef.systemPrompt}\n${promptDef.developerInstructions}`,
    });
  }
}

export default ProjectAIService;
