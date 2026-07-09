import ATSRepository from '../repositories/ATSRepository';
import ATSAnalysisDTO from '../dtos/ATSAnalysisDTO';
import ATSAIService from './ai/ats.service';
import ResumeAIService from './ai/resume.service';

const atsRepo = new ATSRepository();

/**
 * Service for ATS analysis delegating to Gemini AI wrappers.
 */
export class ATSService {
  async analyzeATS(userId: string, data: any) {
    const resumeText = data.resumeText || data.resume || '';
    const jobDescription = data.jobDescription || data.jd || '';

    const analysis = await ATSAIService.analyzeATS(userId, resumeText, jobDescription);

    const record = await atsRepo.create({
      userId,
      score: analysis.overallScore,
      feedback: JSON.stringify(analysis),
    });

    return new ATSAnalysisDTO(record);
  }

  async getHistory(userId: string) {
    const list = await atsRepo.findByUserId(userId);
    return list.map(a => new ATSAnalysisDTO(a));
  }

  /**
   * Optimize resume section segments based on a job description.
   */
  async optimizeATS(userId: string, data: any) {
    const resumeText = data.resumeText || data.resume || '';
    const jobDescription = data.jobDescription || data.jd || '';

    return await ATSAIService.optimizeResume(userId, resumeText, jobDescription);
  }

  /**
   * Rewrites experience description bullet points to match action verbs standards.
   */
  async optimizeBullets(userId: string, data: any) {
    const bulletPoints = data.bulletPoints || [];
    const optimized = await ResumeAIService.optimizeResume(userId, undefined, bulletPoints.join('\n'), undefined);

    return {
      optimized: bulletPoints.map((b: string, i: number) => ({
        original: b,
        improved: optimized.improvedBullets[i] || b,
        changes: 'Added strong action verbs and quantitative outcomes.',
      })),
    };
  }
}

export default ATSService;
