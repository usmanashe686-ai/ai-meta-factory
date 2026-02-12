import { PrismaClient } from '@prisma/client';
import { PasswordUtil } from '../utils/password.util';
import { TokenService, TokenPayload } from './token.service';
import { logger } from '../utils/logger.util';
import jwt from 'jsonwebtoken';
const prisma = new PrismaClient();
export interface RegisterInput { email: string; password: string; name?: string; username?: string; }
export interface LoginInput { email: string; password: string; }
export class AuthService {
  static async register(input: RegisterInput) {
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: input.email }, { username: input.username }] },
    });
    if (existing) throw new Error('User already exists');
    const hashedPassword = await PasswordUtil.hash(input.password);
    const user = await prisma.user.create({
      data: {
        email: input.email,
        password: hashedPassword,
        name: input.name,
        username: input.username,
        provider: 'local',
      },
    });
    logger.info(`User registered: ${user.id} (${user.email})`);
    const accessToken = await TokenService.generateAccessToken(user);
    const refreshToken = await TokenService.generateRefreshToken(user);
    return { user: this.sanitizeUser(user), accessToken, refreshToken };
  }
  static async login(input: LoginInput) {
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user || !user.password) throw new Error('Invalid credentials');
    const isValid = await PasswordUtil.compare(input.password, user.password);
    if (!isValid) throw new Error('Invalid credentials');
    logger.info(`User logged in: ${user.id}`);
    const accessToken = await TokenService.generateAccessToken(user);
    const refreshToken = await TokenService.generateRefreshToken(user);
    return { user: this.sanitizeUser(user), accessToken, refreshToken };
  }
  static async refresh(refreshToken: string) {
    const payload = await TokenService.verifyRefreshToken(refreshToken);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) throw new Error('User not found');
    await TokenService.revokeRefreshToken(payload.jti);
    const accessToken = await TokenService.generateAccessToken(user);
    const newRefreshToken = await TokenService.generateRefreshToken(user);
    return { accessToken, refreshToken: newRefreshToken };
  }
  static async logout(accessTokenPayload: TokenPayload, refreshToken?: string) {
    const expiresIn = accessTokenPayload.exp ? accessTokenPayload.exp - Math.floor(Date.now() / 1000) : 900;
    await TokenService.blacklistAccessToken(accessTokenPayload.jti, expiresIn);
    if (refreshToken) {
      try {
        const payload = jwt.decode(refreshToken) as TokenPayload;
        if (payload?.jti) await TokenService.revokeRefreshToken(payload.jti);
      } catch (e) {}
    }
    logger.info(`User logged out: ${accessTokenPayload.sub}`);
  }
  static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');
    return this.sanitizeUser(user);
  }
  static async updateProfile(userId: string, data: Partial<Pick<any, 'name' | 'username' | 'avatar'>>) {
    const user = await prisma.user.update({ where: { id: userId }, data });
    return this.sanitizeUser(user);
  }
  private static sanitizeUser(user: any) {
    const { password, ...sanitized } = user;
    return sanitized;
  }
}
