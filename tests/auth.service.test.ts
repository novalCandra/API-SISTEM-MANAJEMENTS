import pino from 'pino';
import { beforeEach, describe, expect, it } from 'vitest';
import { UnauthorizedError } from '../src/errors/AppError';
import {
  MemoryRefreshTokenRepository,
  MemoryStore,
  MemoryUserRepository,
} from '../src/repositories/memory/repositories';
import { AuthService } from '../src/services/auth.service';
import { TokenService } from '../src/services/token.service';

describe('AuthService', () => {
  let service: AuthService;
  let store: MemoryStore;

  beforeEach(() => {
    store = new MemoryStore();
    const tokens = new TokenService();
    service = new AuthService(
      new MemoryUserRepository(store),
      new MemoryRefreshTokenRepository(store),
      tokens,
      pino({ level: 'silent' }) as never,
    );
  });

  const credentials = {
    email: 'budi@stokku.id',
    password: 'rahasia123',
    name: 'Budi',
    businessName: 'Warung Budi',
  };

  it('registers and hashes the password', async () => {
    const result = await service.register(credentials);
    expect(result.user.email).toBe('budi@stokku.id');
    const stored = [...store.users.values()][0];
    expect(stored?.passwordHash).not.toContain('rahasia123');
  });

  it('rejects a duplicate email', async () => {
    await service.register(credentials);
    await expect(service.register(credentials)).rejects.toThrow();
  });

  it('rejects a wrong password with a generic error', async () => {
    await service.register(credentials);
    await expect(service.login(credentials.email, 'salahsekali')).rejects.toBeInstanceOf(
      UnauthorizedError,
    );
  });

  it('rotates the refresh token on use', async () => {
    await service.register(credentials);
    const login = await service.login(credentials.email, credentials.password);
    const refreshed = await service.refresh(login.tokens.refreshToken);
    expect(refreshed.tokens.refreshToken).not.toBe(login.tokens.refreshToken);

    await expect(service.refresh(login.tokens.refreshToken)).rejects.toBeInstanceOf(
      UnauthorizedError,
    );
  });

  it('locks the account after too many failed attempts', async () => {
    await service.register(credentials);
    for (let attempt = 0; attempt < 5; attempt += 1) {
      await service.login(credentials.email, 'salah').catch(() => undefined);
    }
    const user = [...store.users.values()][0];
    expect(user?.lockedUntil).toBeGreaterThan(Date.now() - 1);
  });
});
