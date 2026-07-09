import CoverLetterRepository from '../repositories/CoverLetterRepository';
import CoverLetterDTO from '../dtos/CoverLetterDTO';
import ApiError from '../utils/ApiError';
import CoverLetterAIService from './ai/coverLetter.service';

const clRepo = new CoverLetterRepository();

/**
 * Service for generating cover letters delegating to Gemini AI.
 */
export class CoverLetterService {
  async generateCoverLetter(userId: string, data: any) {
    const resumeContent = data.resumeContent || '';
    const jobDescription = `${data.jobTitle || ''} at ${data.company || ''}. ${data.jobDescription || ''}`;
    const tone = data.tone || 'Professional';

    const clResult = await CoverLetterAIService.generateCoverLetter(userId, resumeContent, jobDescription, tone);

    const record = await clRepo.create({
      userId,
      jobTitle: data.jobTitle || 'Software Engineer',
      company: data.company || 'Company',
      content: clResult.content,
    });

    return new CoverLetterDTO(record);
  }

  async getCoverLetters(userId: string) {
    const list = await clRepo.findByUserId(userId);
    return list.map(c => new CoverLetterDTO(c));
  }

  async deleteCoverLetter(id: string, userId: string) {
    const record = await clRepo.softDelete(id, userId);
    if (!record) throw new ApiError(404, 'Cover letter not found.');
    return { success: true };
  }
}

export default CoverLetterService;
