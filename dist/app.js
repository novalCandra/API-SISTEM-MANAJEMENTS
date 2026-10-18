"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const node_crypto_1 = require("node:crypto");
const node_path_1 = __importDefault(require("node:path"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const hpp_1 = __importDefault(require("hpp"));
const pino_http_1 = __importDefault(require("pino-http"));
const env_1 = require("./config/env");
const logger_1 = require("./config/logger");
const AppError_1 = require("./errors/AppError");
const errorHandler_1 = require("./middleware/errorHandler");
const rateLimit_1 = require("./middleware/rateLimit");
const routes_1 = require("./routes");
const corsOptions = {
    origin(origin, callback) {
        if (!origin || env_1.config.clientOrigins.includes(origin)) {
            callback(null, true);
            return;
        }
        logger_1.logger.warn({ origin }, 'cors origin blocked');
        callback(new AppError_1.ForbiddenError('Origin tidak diizinkan'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    maxAge: 600,
};
function createApp(container) {
    const app = (0, express_1.default)();
    app.disable('x-powered-by');
    app.set('trust proxy', 1);
    app.use((0, pino_http_1.default)({
        logger: logger_1.logger,
        genReqId: (_req, res) => {
            const id = (0, node_crypto_1.randomUUID)();
            res.setHeader('x-request-id', id);
            return id;
        },
    }));
    app.use((0, helmet_1.default)({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
        referrerPolicy: { policy: 'no-referrer' },
    }));
    app.use((0, cors_1.default)(corsOptions));
    app.use(express_1.default.json({ limit: '100kb' }));
    app.use(express_1.default.urlencoded({ extended: false, limit: '100kb' }));
    app.use((0, cookie_parser_1.default)());
    app.use((0, hpp_1.default)());
    app.use(rateLimit_1.globalLimiter);
    if (env_1.config.STORAGE_DRIVER === 'local') {
        app.use('/uploads', express_1.default.static(node_path_1.default.resolve(env_1.config.UPLOAD_DIR), {
            index: false,
            dotfiles: 'deny',
            maxAge: '1h',
            setHeaders: (res) => {
                res.setHeader('X-Content-Type-Options', 'nosniff');
                res.setHeader('Content-Disposition', 'inline');
                res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
            },
        }));
    }
    app.use('/api', (0, routes_1.createApiRouter)(container));
    app.use(errorHandler_1.notFoundHandler);
    app.use(errorHandler_1.errorHandler);
    return app;
}
//# sourceMappingURL=app.js.map