import User from '../models/User';

export class UsersRepository {
  async findById(id: string) {
    return User.findOne({ _id: id, isDeleted: false });
  }

  async findByEmail(email: string) {
    return User.findOne({ email, isDeleted: false });
  }

  async create(data: any) {
    return User.create(data);
  }

  async update(id: string, data: any) {
    return User.findOneAndUpdate({ _id: id, isDeleted: false }, data, { new: true });
  }

  async softDelete(id: string) {
    return User.findOneAndUpdate({ _id: id }, { isDeleted: true, deletedAt: new Date() }, { new: true });
  }
}
export default UsersRepository;
