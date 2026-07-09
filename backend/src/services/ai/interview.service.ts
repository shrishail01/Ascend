import AIGateway from './gateway.service';
import ContextBuilderService from './contextBuilder.service';
import prompts from '../../prompts/interview.prompt';
import { interviewQuestionsSchema, interviewScoreSchema } from './schemas/interview.schema';

/**
 * Service managing mock Interview session prompts delegating calls to AIGateway.
 */
export class InterviewAIService {
  static async generateQuestions(
    userId: string,
    jobTitle: string,
    company?: string,
    type = 'technical'
  ): Promise<any> {
    const promptDef = prompts.v1;
    const cleanTitle = ContextBuilderService.cleanContext(jobTitle, 100);
    const cleanCompany = company ? ContextBuilderService.cleanContext(company, 100) : undefined;
    
    const fullPrompt = promptDef.userGeneratePrompt({
      jobTitle: cleanTitle,
      company: cleanCompany,
      type,
    });

    return await AIGateway.request(fullPrompt, {
      userId,
      featureName: 'interview',
      promptVersion: promptDef.version,
      zodSchema: interviewQuestionsSchema,
      systemInstruction: `${promptDef.systemPrompt}\n${promptDef.developerInstructions}`,
    });
  }

  static async scoreResponses(
    userId: string,
    answers: { question: string; answer: string }[]
  ): Promise<any> {
    const promptDef = prompts.v1;
    const cleanAnswers = answers.map((a) => ({
      question: ContextBuilderService.cleanContext(a.question, 500),
      answer: ContextBuilderService.cleanContext(a.answer, 1000),
    }));

    const fullPrompt = promptDef.userScorePrompt({ answers: cleanAnswers });

    return await AIGateway.request(fullPrompt, {
      userId,
      featureName: 'interview',
      promptVersion: promptDef.version,
      zodSchema: interviewScoreSchema,
      systemInstruction: `${promptDef.systemPrompt}\n${promptDef.developerInstructions}`,
    });
  }
}

export default InterviewAIService;
