import InterviewSession from '../models/InterviewSession';

export class InterviewRepository {
  async findById(id: string) {
    return InterviewSession.findOne({ _id: id, isDeleted: false });
  }

  async findByUserId(userId: string) {
    return InterviewSession.find({ userId, isDeleted: false }).sort({ updatedAt: -1 });
  }

  async create(data: any) {
    return InterviewSession.create(data);
  }

  async update(id: string, userId: string, data: any) {
    return InterviewSession.findOneAndUpdate({ _id: id, userId, isDeleted: false }, data, { new: true });
  }

  async softDelete(id: string, userId: string) {
    return InterviewSession.findOneAndUpdate({ _id: id, userId }, { isDeleted: true, deletedAt: new Date() }, { new: true });
  }
}
export default InterviewRepository;
