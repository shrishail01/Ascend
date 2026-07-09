export class InterviewSessionDTO {
  id: string;
  userId: string;
  jobTitle: string;
  company: string;
  type: string;
  questions: any[];
  createdAt: string;

  constructor(session: any) {
    this.id = session._id.toString();
    this.userId = session.userId.toString();
    this.jobTitle = session.jobTitle;
    this.company = session.company;
    this.type = session.type;
    try {
      this.questions = typeof session.questions === 'string' ? JSON.parse(session.questions) : session.questions;
    } catch {
      this.questions = [];
    }
    this.createdAt = session.createdAt instanceof Date ? session.createdAt.toISOString() : session.createdAt;
  }
}
export default InterviewSessionDTO;
