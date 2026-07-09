import RefreshToken from '../models/RefreshToken';

export class RefreshTokensRepository {
  async create(data: { userId: string; tokenHash: string; expiresAt: Date }) {
    return RefreshToken.create(data);
  }

  async findByHash(tokenHash: string) {
    return RefreshToken.findOne({ tokenHash, isDeleted: false });
  }

  async revoke(tokenHash: string) {
    return RefreshToken.findOneAndUpdate({ tokenHash }, { revoked: true }, { new: true });
  }

  async revokeAllForUser(userId: string) {
    return RefreshToken.updateMany({ userId }, { revoked: true });
  }

  async softDelete(id: string) {
    return RefreshToken.findOneAndUpdate({ _id: id }, { isDeleted: true, deletedAt: new Date() }, { new: true });
  }
}
export default RefreshTokensRepository;
