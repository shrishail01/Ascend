import AIGateway from './gateway.service';
import ContextBuilderService from './contextBuilder.service';
import prompts from '../../prompts/linkedin.prompt';
import { linkedinReviewSchema } from './schemas/linkedin.schema';

/**
 * Service managing LinkedIn Profile audits delegating calls to AIGateway.
 */
export class LinkedinAIService {
  static async reviewProfile(
    userId: string,
    headline?: string,
    about?: string,
    experience?: string
  ): Promise<any> {
    const promptDef = prompts.v1;
    const cleanHeadline = headline ? ContextBuilderService.cleanContext(headline, 200) : undefined;
    const cleanAbout = about ? ContextBuilderService.cleanContext(about, 1000) : undefined;
    const cleanExperience = experience ? ContextBuilderService.cleanContext(experience, 1500) : undefined;

    const fullPrompt = promptDef.userPrompt({
      headline: cleanHeadline,
      about: cleanAbout,
      experience: cleanExperience,
    });

    return await AIGateway.request(fullPrompt, {
      userId,
      featureName: 'linkedin',
      promptVersion: promptDef.version,
      zodSchema: linkedinReviewSchema,
      systemInstruction: `${promptDef.systemPrompt}\n${promptDef.developerInstructions}`,
    });
  }
}

export default LinkedinAIService;
