"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadLimiter = exports.loginLimiter = exports.globalLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const env_1 = require("../config/env");
const logger_1 = require("../config/logger");
const buildOptions = (overrides) => ({
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger_1.logger.warn({ requestId: req.id, path: req.path, ip: req.ip }, 'rate limit exceeded');
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
exports.globalLimiter = (0, express_rate_limit_1.default)(buildOptions({ windowMs: env_1.config.RATE_LIMIT_WINDOW_MS, max: env_1.config.RATE_LIMIT_MAX }));
exports.loginLimiter = (0, express_rate_limit_1.default)(buildOptions({
    windowMs: env_1.config.LOGIN_RATE_LIMIT_WINDOW_MS,
    max: env_1.config.LOGIN_RATE_LIMIT_MAX,
}));
exports.uploadLimiter = (0, express_rate_limit_1.default)(buildOptions({ windowMs: env_1.config.RATE_LIMIT_WINDOW_MS, max: env_1.config.UPLOAD_RATE_LIMIT_MAX }));
//# sourceMappingURL=rateLimit.js.map