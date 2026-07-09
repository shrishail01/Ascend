import AIGateway from './gateway.service';
import ContextBuilderService from './contextBuilder.service';
import prompts from '../../prompts/coverLetter.prompt';
import { coverLetterSchema } from './schemas/coverLetter.schema';

/**
 * Service managing Cover Letter generation prompts delegating calls to AIGateway.
 */
export class CoverLetterAIService {
  static async generateCoverLetter(
    userId: string,
    resumeContent: string,
    jobDescription: string,
    tone = 'Professional'
  ): Promise<any> {
    const cleanResume = ContextBuilderService.cleanContext(resumeContent);
    const cleanJob = ContextBuilderService.cleanContext(jobDescription);
    const promptDef = prompts.v1;

    const fullPrompt = promptDef.userPrompt({
      resumeContent: cleanResume,
      jobDescription: cleanJob,
      tone,
    });

    return await AIGateway.request(fullPrompt, {
      userId,
      featureName: 'coverLetter',
      promptVersion: promptDef.version,
      zodSchema: coverLetterSchema,
      systemInstruction: `${promptDef.systemPrompt}\n${promptDef.developerInstructions}`,
    });
  }
}

export default CoverLetterAIService;
