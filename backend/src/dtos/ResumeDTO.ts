export class ResumeDTO {
  id: string;
  userId: string;
  title: string;
  template: string;
  content: any;
  updatedAt: string;

  constructor(resume: any) {
    this.id = resume._id.toString();
    this.userId = resume.userId.toString();
    this.title = resume.title;
    this.template = resume.template;
    try {
      this.content = typeof resume.content === 'string' ? JSON.parse(resume.content) : resume.content;
    } catch {
      this.content = {};
    }
    this.updatedAt = resume.updatedAt instanceof Date ? resume.updatedAt.toISOString() : resume.updatedAt;
  }
}
export default ResumeDTO;
