import CoverLetter from '../models/CoverLetter';

export class CoverLetterRepository {
  async findById(id: string) {
    return CoverLetter.findOne({ _id: id, isDeleted: false });
  }

  async findByUserId(userId: string) {
    return CoverLetter.find({ userId, isDeleted: false }).sort({ updatedAt: -1 });
  }

  async create(data: any) {
    return CoverLetter.create(data);
  }

  async softDelete(id: string, userId: string) {
    return CoverLetter.findOneAndUpdate({ _id: id, userId }, { isDeleted: true, deletedAt: new Date() }, { new: true });
  }
}
export default CoverLetterRepository;
