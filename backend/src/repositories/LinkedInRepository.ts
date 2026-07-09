import LinkedInReview from '../models/LinkedInReview';

export class LinkedInRepository {
  async findById(id: string) {
    return LinkedInReview.findOne({ _id: id, isDeleted: false });
  }

  async findByUserId(userId: string) {
    return LinkedInReview.find({ userId, isDeleted: false }).sort({ updatedAt: -1 });
  }

  async create(data: any) {
    return LinkedInReview.create(data);
  }

  async softDelete(id: string, userId: string) {
    return LinkedInReview.findOneAndUpdate({ _id: id, userId }, { isDeleted: true, deletedAt: new Date() }, { new: true });
  }
}
export default LinkedInRepository;
