
import pino from 'pino';
import { config } from './env';

export const logger = pino({
  level: config.LOG_LEVEL || 'info',

  base: {
    service: 'stokku-api',
    env: config.NODE_ENV,
  },

  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'res.headers["set-cookie"]',
      'password',
      'passwordHash',
      'accessToken',
      'refreshToken',
      'token',
      '*.password',
      '*.refreshToken',
      '*.accessToken',
    ],
    censor: '[REDACTED]',
  },
});

export type Logger = typeof logger;
