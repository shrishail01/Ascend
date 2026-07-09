export class ProjectDTO {
  id: string;
  userId: string;
  title: string;
  description: string;
  skills: string[];
  difficulty: string;
  timeEstimate?: string;
  githubIdea?: string;

  constructor(project: any) {
    this.id = project._id.toString();
    this.userId = project.userId.toString();
    this.title = project.title;
    this.description = project.description;
    this.skills = project.skills;
    this.difficulty = project.difficulty;
    this.timeEstimate = project.timeEstimate;
    this.githubIdea = project.githubIdea;
  }
}
export default ProjectDTO;
