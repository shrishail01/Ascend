import Subscription from '../models/Subscription';

export class SubscriptionsRepository {
  async findById(id: string) {
    return Subscription.findOne({ _id: id, isDeleted: false });
  }

  async findByUserId(userId: string) {
    return Subscription.findOne({ userId, isDeleted: false });
  }

  async create(data: any) {
    return Subscription.create(data);
  }

  async update(userId: string, data: any) {
    return Subscription.findOneAndUpdate({ userId, isDeleted: false }, data, { new: true, upsert: true });
  }

  async softDelete(id: string) {
    return Subscription.findOneAndUpdate({ _id: id }, { isDeleted: true, deletedAt: new Date() }, { new: true });
  }
}
export default SubscriptionsRepository;
