export class JobApplicationDTO {
  id: string;
  userId: string;
  company: string;
  role: string;
  jobUrl?: string;
  status: string;
  salary?: string;
  notes?: string;
  appliedDate?: string;
  reminderDate?: string;

  constructor(app: any) {
    this.id = app._id.toString();
    this.userId = app.userId.toString();
    this.company = app.company;
    this.role = app.role;
    this.jobUrl = app.jobUrl;
    this.status = app.status;
    this.salary = app.salary;
    this.notes = app.notes;
    this.appliedDate = app.appliedDate ? (app.appliedDate instanceof Date ? app.appliedDate.toISOString() : app.appliedDate) : undefined;
    this.reminderDate = app.reminderDate ? (app.reminderDate instanceof Date ? app.reminderDate.toISOString() : app.reminderDate) : undefined;
  }
}
export default JobApplicationDTO;
