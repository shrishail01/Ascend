import ATSAnalysis from '../models/ATSAnalysis';

export class ATSRepository {
  async findById(id: string) {
    return ATSAnalysis.findOne({ _id: id, isDeleted: false });
  }

  async findByUserId(userId: string) {
    return ATSAnalysis.find({ userId, isDeleted: false }).sort({ updatedAt: -1 });
  }

  async create(data: any) {
    return ATSAnalysis.create(data);
  }

  async softDelete(id: string, userId: string) {
    return ATSAnalysis.findOneAndUpdate({ _id: id, userId }, { isDeleted: true, deletedAt: new Date() }, { new: true });
  }
}
export default ATSRepository;
