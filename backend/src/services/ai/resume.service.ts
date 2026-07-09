import AIGateway from './gateway.service';
import ContextBuilderService from './contextBuilder.service';
import prompts from '../../prompts/resume.prompt';
import { resumeOptimizeSchema } from './schemas/resume.schema';

/**
 * Service managing Resume optimization prompts delegating calls to AIGateway.
 */
export class ResumeAIService {
  static async optimizeResume(
    userId: string,
    summary?: string,
    experience?: string,
    skills?: string[]
  ): Promise<any> {
    const promptDef = prompts.v1;
    const cleanSummary = summary ? ContextBuilderService.cleanContext(summary, 1000) : undefined;
    const cleanExperience = experience ? ContextBuilderService.cleanContext(experience, 2000) : undefined;
    const cleanSkills = skills ? skills.map((s) => ContextBuilderService.cleanContext(s, 50)) : undefined;

    const fullPrompt = promptDef.userPrompt({
      summary: cleanSummary,
      experience: cleanExperience,
      skills: cleanSkills,
    });

    return await AIGateway.request(fullPrompt, {
      userId,
      featureName: 'resume',
      promptVersion: promptDef.version,
      zodSchema: resumeOptimizeSchema,
      systemInstruction: `${promptDef.systemPrompt}\n${promptDef.developerInstructions}`,
    });
  }
}

export default ResumeAIService;
