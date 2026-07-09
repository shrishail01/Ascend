import Project from '../models/Project';

export class ProjectsRepository {
  async findById(id: string) {
    return Project.findOne({ _id: id, isDeleted: false });
  }

  async findByUserId(userId: string) {
    return Project.find({ userId, isDeleted: false }).sort({ updatedAt: -1 });
  }

  async create(data: any) {
    return Project.create(data);
  }

  async softDelete(id: string, userId: string) {
    return Project.findOneAndUpdate({ _id: id, userId }, { isDeleted: true, deletedAt: new Date() }, { new: true });
  }
}
export default ProjectsRepository;
