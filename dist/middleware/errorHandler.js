"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.notFoundHandler = void 0;
const zod_1 = require("zod");
const logger_1 = require("../config/logger");
const AppError_1 = require("../errors/AppError");
const notFoundHandler = (req, res) => {
    res.status(404).json({
        error: {
            code: 'NOT_FOUND',
            message: 'Endpoint tidak ditemukan',
            requestId: req.id,
        },
    });
};
exports.notFoundHandler = notFoundHandler;
const errorHandler = (err, req, res, _next) => {
    const requestId = req.id;
    if (err instanceof AppError_1.AppError) {
        if (err.statusCode >= 500) {
            logger_1.logger.error({ requestId, err, path: req.path }, err.message);
        }
        else {
            logger_1.logger.warn({ requestId, code: err.code, path: req.path }, err.message);
        }
        res.status(err.statusCode).json({
            error: {
                code: err.code,
                message: err.message,
                ...(err.details ? { details: err.details } : {}),
                requestId,
            },
        });
        return;
    }
    if (err instanceof zod_1.ZodError) {
        logger_1.logger.warn({ requestId, path: req.path }, 'unhandled validation error');
        res.status(400).json({
            error: {
                code: 'BAD_REQUEST',
                message: 'Validasi gagal',
                details: err.issues.map((issue) => ({
                    path: issue.path.join('.'),
                    message: issue.message,
                })),
                requestId,
            },
        });
        return;
    }
    logger_1.logger.error({ requestId, err, path: req.path }, 'unhandled exception');
    res.status(500).json({
        error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Terjadi kesalahan pada server',
            requestId,
        },
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map