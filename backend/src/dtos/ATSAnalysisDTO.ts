export class ATSAnalysisDTO {
  id: string;
  userId: string;
  resumeId?: string;
  score: number;
  feedback: any;
  createdAt: string;

  constructor(analysis: any) {
    this.id = analysis._id.toString();
    this.userId = analysis.userId.toString();
    this.resumeId = analysis.resumeId ? analysis.resumeId.toString() : undefined;
    this.score = analysis.score;
    try {
      this.feedback = typeof analysis.feedback === 'string' ? JSON.parse(analysis.feedback) : analysis.feedback;
    } catch {
      this.feedback = {};
    }
    this.createdAt = analysis.createdAt instanceof Date ? analysis.createdAt.toISOString() : analysis.createdAt;
  }
}
export default ATSAnalysisDTO;
