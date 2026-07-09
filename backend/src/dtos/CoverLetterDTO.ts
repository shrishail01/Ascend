export class CoverLetterDTO {
  id: string;
  userId: string;
  jobTitle: string;
  company: string;
  content: string;
  createdAt: string;

  constructor(cl: any) {
    this.id = cl._id.toString();
    this.userId = cl.userId.toString();
    this.jobTitle = cl.jobTitle;
    this.company = cl.company;
    this.content = cl.content;
    this.createdAt = cl.createdAt instanceof Date ? cl.createdAt.toISOString() : cl.createdAt;
  }
}
export default CoverLetterDTO;
