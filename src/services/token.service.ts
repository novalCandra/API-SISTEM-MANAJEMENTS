import { createHash, randomUUID } from 'node:crypto';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { config } from '../config/env';
import { UnauthorizedError } from '../errors/AppError';
import type { User } from '../types/domain';

export interface AccessTokenPayload {
  sub: string;
  email: string;
  type: 'access';
}

export interface RefreshTokenPayload {
  sub: string;
  jti: string;
  type: 'refresh';
}

export class TokenService {
  signAccessToken(user: Pick<User, 'id' | 'email'>): string {
    const payload: AccessTokenPayload = { sub: user.id, email: user.email, type: 'access' };
    return jwt.sign(payload, config.JWT_ACCESS_SECRET, {
      algorithm: 'HS256',
      expiresIn: config.JWT_ACCESS_TTL as SignOptions['expiresIn'],
    });
  }

  verifyAccessToken(token: string): AccessTokenPayload {
    let decoded: unknown;
    try {
      decoded = jwt.verify(token, config.JWT_ACCESS_SECRET, { algorithms: ['HS256'] });
    } catch {
      throw new UnauthorizedError('Sesi berakhir, silakan masuk kembali');
    }
    if (typeof decoded !== 'object' || decoded === null) {
      throw new UnauthorizedError('Token tidak valid');
    }
    const payload = decoded as Partial<AccessTokenPayload>;
    if (payload.type !== 'access' || typeof payload.sub !== 'string') {
      throw new UnauthorizedError('Token tidak valid');
    }
    return { sub: payload.sub, email: String(payload.email ?? ''), type: 'access' };
  }

  createRefreshToken(userId: string): { token: string; jti: string; expiresAt: number } {
    const jti = randomUUID();
    const token = jwt.sign({ sub: userId, jti, type: 'refresh' } satisfies RefreshTokenPayload, config.JWT_REFRESH_SECRET, {
      algorithm: 'HS256',
      expiresIn: config.JWT_REFRESH_TTL as SignOptions['expiresIn'],
    });
    const decoded = jwt.decode(token) as { exp?: number } | null;
    const expiresAt = decoded?.exp ? decoded.exp * 1000 : Date.now() + 7 * 24 * 60 * 60 * 1000;
    return { token, jti, expiresAt };
  }

  verifyRefreshToken(token: string): RefreshTokenPayload {
    let decoded: unknown;
    try {
      decoded = jwt.verify(token, config.JWT_REFRESH_SECRET, { algorithms: ['HS256'] });
    } catch {
      throw new UnauthorizedError('Sesi berakhir, silakan masuk kembali');
    }
    if (typeof decoded !== 'object' || decoded === null) {
      throw new UnauthorizedError('Token tidak valid');
    }
    const payload = decoded as Partial<RefreshTokenPayload>;
    if (payload.type !== 'refresh' || typeof payload.sub !== 'string' || typeof payload.jti !== 'string') {
      throw new UnauthorizedError('Token tidak valid');
    }
    return { sub: payload.sub, jti: payload.jti, type: 'refresh' };
  }

  hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
