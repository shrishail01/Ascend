import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import env from '../config/env';
import UsersRepository from '../repositories/UsersRepository';
import RefreshTokensRepository from '../repositories/RefreshTokensRepository';
import ApiError from '../utils/ApiError';
import UserDTO from '../dtos/UserDTO';

const usersRepo = new UsersRepository();
const tokensRepo = new RefreshTokensRepository();

/**
 * Authentication service handling login, signup, and rotated session validation.
 */
export class AuthService {
  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  generateAccessToken(userId: string): string {
    return jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: '15m' });
  }

  async generateRefreshToken(userId: string): Promise<string> {
    const rawToken = crypto.randomBytes(40).toString('hex');
    const tokenHash = this.hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await tokensRepo.create({ userId, tokenHash, expiresAt });
    return rawToken;
  }

  async signup(data: any) {
    const existing = await usersRepo.findByEmail(data.email);
    if (existing) {
      throw new ApiError(409, 'Email address is already registered.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    const user = await usersRepo.create({
      ...data,
      password: passwordHash,
    });

    const accessToken = this.generateAccessToken(user._id.toString());
    const refreshToken = await this.generateRefreshToken(user._id.toString());

    return { user: new UserDTO(user), accessToken, refreshToken };
  }

  async login(data: any) {
    const user = await usersRepo.findByEmail(data.email);
    if (!user) {
      throw new ApiError(401, 'Invalid email or password.');
    }

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid email or password.');
    }

    const accessToken = this.generateAccessToken(user._id.toString());
    const refreshToken = await this.generateRefreshToken(user._id.toString());

    return { user: new UserDTO(user), accessToken, refreshToken };
  }

  async refresh(refreshToken: string) {
    const tokenHash = this.hashToken(refreshToken);
    const record = await tokensRepo.findByHash(tokenHash);

    if (!record || record.revoked || Date.now() > record.expiresAt.getTime()) {
      if (record) {
        // Revoke all tokens for user on theft detection!
        await tokensRepo.revokeAllForUser(record.userId.toString());
      }
      throw new ApiError(401, 'Invalid or expired refresh token.');
    }

    // Revoke old token and rotate!
    await tokensRepo.revoke(tokenHash);

    const user = await usersRepo.findById(record.userId.toString());
    if (!user) {
      throw new ApiError(401, 'User no longer exists.');
    }

    const newAccessToken = this.generateAccessToken(user._id.toString());
    const newRefreshToken = await this.generateRefreshToken(user._id.toString());

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async logout(refreshToken: string) {
    const tokenHash = this.hashToken(refreshToken);
    await tokensRepo.revoke(tokenHash);
  }
}
export default AuthService;
