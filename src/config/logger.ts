
import pino, { type LoggerOptions } from 'pino';
import { config } from './env';

const isProduction = process.env.NODE_ENV === 'production';

const loggerOptions: LoggerOptions = {
  level: config.LOG_LEVEL,

  base: {
    service: 'stokku-api',
    env: process.env.NODE_ENV ?? config.NODE_ENV,
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
};

// Pretty logging is only enabled in development.
if (!isProduction) {
  loggerOptions.transport = {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss',
    },
  };
}

export const logger = pino(loggerOptions);

export type Logger = typeof logger;
