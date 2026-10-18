import type { NextFunction, Request, Response } from 'express';
import type { Logger } from '../config/logger';
import { UnauthorizedError } from '../errors/AppError';
import type { TokenService } from '../services/token.service';

export function createAuthMiddleware(tokens: TokenService, logger: Logger) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      logger.warn({ requestId: req.id, path: req.path }, 'access denied: missing bearer token');
      throw new UnauthorizedError('Tidak terautentikasi');
    }

    const token = header.slice('Bearer '.length).trim();
    const payload = tokens.verifyAccessToken(token);
    req.user = payload;
    next();
  };
}
