import rateLimit, { type Options } from 'express-rate-limit';
import { config } from '../config/env';
import { logger } from '../config/logger';

const buildOptions = (overrides: Partial<Options>): Partial<Options> => ({
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn({ requestId: req.id, path: req.path, ip: req.ip }, 'rate limit exceeded');
    res.status(429).json({
      error: {
        code: 'TOO_MANY_REQUESTS',
        message: 'Terlalu banyak permintaan, coba lagi nanti',
        requestId: req.id,
      },
    });
  },
  ...overrides,
});

export const globalLimiter = rateLimit(
  buildOptions({ windowMs: config.RATE_LIMIT_WINDOW_MS, max: config.RATE_LIMIT_MAX }),
);

export const loginLimiter = rateLimit(
  buildOptions({
    windowMs: config.LOGIN_RATE_LIMIT_WINDOW_MS,
    max: config.LOGIN_RATE_LIMIT_MAX,
  }),
);

export const uploadLimiter = rateLimit(
  buildOptions({ windowMs: config.RATE_LIMIT_WINDOW_MS, max: config.UPLOAD_RATE_LIMIT_MAX }),
);
