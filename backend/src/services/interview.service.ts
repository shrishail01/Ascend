import InterviewRepository from '../repositories/InterviewRepository';
import InterviewSessionDTO from '../dtos/InterviewSessionDTO';
import ApiError from '../utils/ApiError';
import InterviewAIService from './ai/interview.service';

const interviewRepo = new InterviewRepository();

/**
 * Service for managing interview preparation sessions delegating to Gemini AI.
 */
export class InterviewService {
  async startSession(userId: string, data: any) {
    const aiQuestions = await InterviewAIService.generateQuestions(
      userId,
      data.jobTitle,
      data.company,
      data.type
    );

    const session = await interviewRepo.create({
      userId,
      jobTitle: data.jobTitle,
      company: data.company,
      type: data.type,
      questions: JSON.stringify(aiQuestions.questions.map((q: any) => ({ ...q, answer: '', feedback: '', score: 0 }))),
    });

    return new InterviewSessionDTO(session);
  }

  async scoreAnswers(userId: string, data: any) {
    const session = await interviewRepo.findById(data.sessionId);
    if (!session || session.userId.toString() !== userId) {
      throw new ApiError(404, 'Interview session not found.');
    }

    const aiScoreResult = await InterviewAIService.scoreResponses(userId, data.answers);

    // Update questions feedback and overall score in db session
    await interviewRepo.update(data.sessionId, userId, {
      questions: JSON.stringify(aiScoreResult.questionFeedback),
      score: aiScoreResult.overallScore,
    });

    return {
      overallScore: aiScoreResult.overallScore,
      feedback: aiScoreResult.feedback,
      questionFeedback: aiScoreResult.questionFeedback,
    };
  }

  async getHistory(userId: string) {
    const list = await interviewRepo.findByUserId(userId);
    return list.map(s => new InterviewSessionDTO(s));
  }
}

export default InterviewService;
