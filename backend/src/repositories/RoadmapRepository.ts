import CareerRoadmap from '../models/CareerRoadmap';

export class RoadmapRepository {
  async findById(id: string) {
    return CareerRoadmap.findOne({ _id: id, isDeleted: false });
  }

  async findByUserId(userId: string) {
    return CareerRoadmap.find({ userId, isDeleted: false }).sort({ updatedAt: -1 });
  }

  async create(data: any) {
    return CareerRoadmap.create(data);
  }

  async softDelete(id: string, userId: string) {
    return CareerRoadmap.findOneAndUpdate({ _id: id, userId }, { isDeleted: true, deletedAt: new Date() }, { new: true });
  }
}
export default RoadmapRepository;
