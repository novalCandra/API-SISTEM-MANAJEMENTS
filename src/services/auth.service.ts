import argon2 from 'argon2';
import type { Logger } from '../config/logger';
import { ConflictError, TooManyRequestsError, UnauthorizedError } from '../errors/AppError';
import type { IRefreshTokenRepository, IUserRepository } from '../repositories/interfaces';
import type { PublicUser, User } from '../types/domain';
import { newId } from '../utils/id';
import type { TokenService } from './token.service';

const ARGON_OPTIONS: argon2.Options = {
  type: argon2.argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
};

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;
const MIN_PASSWORD_LENGTH = 8;

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  refreshExpiresAt: number;
}

export interface AuthResult {
  user: PublicUser;
  tokens: AuthTokens;
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  businessName: string;
  dailyTarget?: number;
}

export const toPublicUser = (user: User): PublicUser => ({
  id: user.id,
  email: user.email,
  name: user.name,
  businessName: user.businessName,
  dailyTarget: user.dailyTarget,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export class AuthService {
  constructor(
    private readonly users: IUserRepository,
    private readonly refreshTokens: IRefreshTokenRepository,
    private readonly tokens: TokenService,
    private readonly logger: Logger,
  ) {}

  async register(input: RegisterInput): Promise<AuthResult> {
    const email = input.email.trim().toLowerCase();
    const existing = await this.users.findByEmail(email);
    if (existing) {
      throw new ConflictError('Email sudah terdaftar');
    }

    const now = new Date().toISOString();
    const passwordHash = await argon2.hash(input.password, ARGON_OPTIONS);
    const user: User = {
      id: newId(),
      email,
      name: input.name.trim(),
      businessName: input.businessName.trim(),
      passwordHash,
      dailyTarget: input.dailyTarget && input.dailyTarget > 0 ? Math.floor(input.dailyTarget) : 50,
      failedLoginAttempts: 0,
      lockedUntil: null,
      createdAt: now,
      updatedAt: now,
    };

    await this.users.create(user);
    this.logger.info({ userId: user.id }, 'user registered');

    const tokens = await this.issueTokens(user);
    return { user: toPublicUser(user), tokens };
  }

  async login(email: string, password: string): Promise<AuthResult> {
    const normalized = email.trim().toLowerCase();
    const user = await this.users.findByEmail(normalized);
    const genericError = new UnauthorizedError('Email atau kata sandi salah');

    if (!user) {
      this.logger.warn({ email: normalized }, 'login failed: unknown email');
      throw genericError;
    }

    if (user.lockedUntil && user.lockedUntil > Date.now()) {
      this.logger.warn({ userId: user.id }, 'login blocked: account locked');
      throw new TooManyRequestsError('Akun terkunci sementara. Coba lagi beberapa saat lagi.');
    }

    const valid = await argon2.verify(user.passwordHash, password).catch(() => false);
    if (!valid) {
      const attempts = user.failedLoginAttempts + 1;
      const shouldLock = attempts >= MAX_FAILED_ATTEMPTS;
      await this.users.update(user.id, {
        failedLoginAttempts: shouldLock ? 0 : attempts,
        lockedUntil: shouldLock ? Date.now() + LOCK_DURATION_MS : null,
        updatedAt: new Date().toISOString(),
      });
      this.logger.warn({ userId: user.id, attempts }, 'login failed: bad password');
      throw genericError;
    }

    if (user.failedLoginAttempts !== 0 || user.lockedUntil) {
      await this.users.update(user.id, {
        failedLoginAttempts: 0,
        lockedUntil: null,
        updatedAt: new Date().toISOString(),
      });
    }

    this.logger.info({ userId: user.id }, 'login success');
    const tokens = await this.issueTokens(user);
    return { user: toPublicUser(user), tokens };
  }

  async refresh(refreshToken: string): Promise<AuthResult> {
    const payload = this.tokens.verifyRefreshToken(refreshToken);
    const record = await this.refreshTokens.findById(payload.jti);

    if (!record) {
      throw new UnauthorizedError('Sesi berakhir, silakan masuk kembali');
    }

    const providedHash = this.tokens.hashToken(refreshToken);
    if (
      record.revokedAt ||
      record.tokenHash !== providedHash ||
      record.expiresAt < Date.now()
    ) {
      await this.refreshTokens.revokeAllForUser(record.userId);
      this.logger.warn({ userId: record.userId }, 'refresh rejected: token reuse or expiry');
      throw new UnauthorizedError('Sesi berakhir, silakan masuk kembali');
    }

    const user = await this.users.findById(record.userId);
    if (!user) {
      throw new UnauthorizedError('Sesi berakhir, silakan masuk kembali');
    }

    const tokens = await this.issueTokens(user);
    const newPayload = this.tokens.verifyRefreshToken(tokens.refreshToken);
    await this.refreshTokens.revoke(record.id, newPayload.jti);

    return { user: toPublicUser(user), tokens };
  }

  async logout(refreshToken: string | null): Promise<void> {
    if (!refreshToken) return;
    try {
      const payload = this.tokens.verifyRefreshToken(refreshToken);
      await this.refreshTokens.revoke(payload.jti);
    } catch {
      return;
    }
  }

  async me(userId: string): Promise<PublicUser> {
    const user = await this.users.findById(userId);
    if (!user) {
      throw new UnauthorizedError('Sesi berakhir, silakan masuk kembali');
    }
    return toPublicUser(user);
  }

  static get passwordPolicy() {
    return { minLength: MIN_PASSWORD_LENGTH };
  }

  private async issueTokens(user: User): Promise<AuthTokens> {
    const accessToken = this.tokens.signAccessToken(user);
    const { token, jti, expiresAt } = this.tokens.createRefreshToken(user.id);
    await this.refreshTokens.create({
      id: jti,
      userId: user.id,
      tokenHash: this.tokens.hashToken(token),
      replacedBy: null,
      revokedAt: null,
      expiresAt,
      createdAt: new Date().toISOString(),
    });
    return { accessToken, refreshToken: token, refreshExpiresAt: expiresAt };
  }
}
