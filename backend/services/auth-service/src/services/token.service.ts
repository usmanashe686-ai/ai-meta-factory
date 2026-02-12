import jwt from 'jsonwebtoken';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
const redis = new Redis(process.env.REDIS_URL!);
export interface TokenPayload {
  sub: string;
  email: string;
  type: 'access' | 'refresh';
  jti: string;
}
export class TokenService {
  static async generateAccessToken(user: { id: string; email: string }): Promise<string> {
    const payload: TokenPayload = {
      sub: user.id,
      email: user.email,
      type: 'access',
      jti: uuidv4(),
    };
    return jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: process.env.JWT_ACCESS_EXPIRATION || '15m',
    });
  }
  static async generateRefreshToken(user: { id: string; email: string }): Promise<string> {
    const payload: TokenPayload = {
      sub: user.id,
      email: user.email,
      type: 'refresh',
      jti: uuidv4(),
    };
    const token = jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
      expiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d',
    });
    await redis.setex(`refresh:${payload.jti}`, 7 * 24 * 60 * 60, user.id);
    return token;
  }
  static async verifyAccessToken(token: string): Promise<TokenPayload> {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
    if (decoded.type !== 'access') throw new Error('Invalid token type');
    const blacklisted = await redis.get(`blacklist:${decoded.jti}`);
    if (blacklisted) throw new Error('Token revoked');
    return decoded;
  }
  static async verifyRefreshToken(token: string): Promise<TokenPayload> {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as TokenPayload;
    if (decoded.type !== 'refresh') throw new Error('Invalid token type');
    const userId = await redis.get(`refresh:${decoded.jti}`);
    if (!userId || userId !== decoded.sub) throw new Error('Refresh token invalid or expired');
    return decoded;
  }
  static async revokeRefreshToken(jti: string): Promise<void> {
    await redis.del(`refresh:${jti}`);
  }
  static async blacklistAccessToken(jti: string, expiresIn: number): Promise<void> {
    await redis.setex(`blacklist:${jti}`, expiresIn, 'revoked');
  }
}
