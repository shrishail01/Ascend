import AIGateway from './gateway.service';
import ContextBuilderService from './contextBuilder.service';
import prompts from '../../prompts/roadmap.prompt';
import { roadmapSchema } from './schemas/roadmap.schema';

/**
 * Service managing Career Roadmap prompts delegating calls to AIGateway.
 */
export class RoadmapAIService {
  static async generateRoadmap(
    userId: string,
    targetRole: string,
    targetIndustry?: string,
    currentRole?: string,
    currentSkills?: string[]
  ): Promise<any> {
    const promptDef = prompts.v1;
    const cleanRole = ContextBuilderService.cleanContext(targetRole, 100);
    const cleanIndustry = targetIndustry ? ContextBuilderService.cleanContext(targetIndustry, 100) : undefined;
    const cleanCurrentRole = currentRole ? ContextBuilderService.cleanContext(currentRole, 100) : undefined;
    const cleanSkills = currentSkills ? currentSkills.map((s) => ContextBuilderService.cleanContext(s, 50)) : undefined;

    const fullPrompt = promptDef.userPrompt({
      targetRole: cleanRole,
      targetIndustry: cleanIndustry,
      currentRole: cleanCurrentRole,
      currentSkills: cleanSkills,
    });

    return await AIGateway.request(fullPrompt, {
      userId,
      featureName: 'roadmap',
      promptVersion: promptDef.version,
      zodSchema: roadmapSchema,
      systemInstruction: `${promptDef.systemPrompt}\n${promptDef.developerInstructions}`,
    });
  }
}

export default RoadmapAIService;
