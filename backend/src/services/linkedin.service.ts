import LinkedInRepository from '../repositories/LinkedInRepository';
import LinkedInReviewDTO from '../dtos/LinkedInReviewDTO';
import LinkedinAIService from './ai/linkedin.service';

const linkedinRepo = new LinkedInRepository();

/**
 * Service for LinkedIn profile auditing delegating to Gemini AI.
 */
export class LinkedInService {
  async reviewProfile(userId: string, data: any) {
    const analysis = await LinkedinAIService.reviewProfile(
      userId,
      data.headline,
      data.about,
      data.experience
    );

    await linkedinRepo.create({
      userId,
      profileSection: data.profileSection || 'all',
      originalText: JSON.stringify(data),
      suggestions: JSON.stringify(analysis.sections),
    });

    return analysis;
  }

  async getHistory(userId: string) {
    const list = await linkedinRepo.findByUserId(userId);
    return list.map(l => new LinkedInReviewDTO(l));
  }
}

export default LinkedInService;
