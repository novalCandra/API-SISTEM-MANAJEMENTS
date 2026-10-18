"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const pino_1 = __importDefault(require("pino"));
const env_1 = require("./env");
exports.logger = (0, pino_1.default)({
    level: env_1.config.LOG_LEVEL,
    base: { service: 'stokku-api', env: env_1.config.NODE_ENV },
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
    transport: env_1.config.isProduction
        ? undefined
        : {
            target: 'pino-pretty',
            options: { colorize: true, translateTime: 'HH:MM:ss' },
        },
});
//# sourceMappingURL=logger.js.map