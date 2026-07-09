import JobApplication from '../models/JobApplication';

export class JobsRepository {
  async findById(id: string) {
    return JobApplication.findOne({ _id: id, isDeleted: false });
  }

  async findByUserId(userId: string) {
    return JobApplication.find({ userId, isDeleted: false }).sort({ createdAt: -1 });
  }

  async create(data: any) {
    return JobApplication.create(data);
  }

  async update(id: string, userId: string, data: any) {
    return JobApplication.findOneAndUpdate({ _id: id, userId, isDeleted: false }, data, { new: true });
  }

  async softDelete(id: string, userId: string) {
    return JobApplication.findOneAndUpdate({ _id: id, userId }, { isDeleted: true, deletedAt: new Date() }, { new: true });
  }
}
export default JobsRepository;
