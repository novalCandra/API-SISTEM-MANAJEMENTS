import type { AccessTokenPayload } from '../services/token.service';

declare global {
  namespace Express {
    interface Request {
      id?: string;
      requestId?: string;
      user?: AccessTokenPayload;
    }
  }
}

export {};
