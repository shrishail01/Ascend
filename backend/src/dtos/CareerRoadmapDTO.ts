export class CareerRoadmapDTO {
  id: string;
  userId: string;
  currentRole?: string;
  targetRole: string;
  summary?: string;
  timelineMonths: number;
  skillGaps: any[];
  milestones: any[];
  salaryRange: { current: string; target: string };
  certifications: any[];

  constructor(roadmap: any) {
    this.id = roadmap._id.toString();
    this.userId = roadmap.userId.toString();
    this.currentRole = roadmap.currentRole;
    this.targetRole = roadmap.targetRole;
    this.summary = roadmap.summary;
    this.timelineMonths = roadmap.timelineMonths;
    try {
      this.skillGaps = typeof roadmap.skillGaps === 'string' ? JSON.parse(roadmap.skillGaps) : roadmap.skillGaps;
    } catch {
      this.skillGaps = [];
    }
    try {
      this.milestones = typeof roadmap.milestones === 'string' ? JSON.parse(roadmap.milestones) : roadmap.milestones;
    } catch {
      this.milestones = [];
    }
    this.salaryRange = roadmap.salaryRange || { current: '', target: '' };
    try {
      this.certifications = typeof roadmap.certifications === 'string' ? JSON.parse(roadmap.certifications) : roadmap.certifications;
    } catch {
      this.certifications = [];
    }
  }
}
export default CareerRoadmapDTO;
