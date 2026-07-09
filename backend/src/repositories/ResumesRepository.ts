import Resume from '../models/Resume';

export class ResumesRepository {
  async findById(id: string) {
    return Resume.findOne({ _id: id, isDeleted: false });
  }

  async findByUserId(userId: string) {
    return Resume.find({ userId, isDeleted: false }).sort({ updatedAt: -1 });
  }

  async create(data: any) {
    return Resume.create(data);
  }

  async update(id: string, userId: string, data: any) {
    return Resume.findOneAndUpdate({ _id: id, userId, isDeleted: false }, data, { new: true });
  }

  async softDelete(id: string, userId: string) {
    return Resume.findOneAndUpdate({ _id: id, userId }, { isDeleted: true, deletedAt: new Date() }, { new: true });
  }
}
export default ResumesRepository;
