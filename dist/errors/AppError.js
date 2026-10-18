"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayloadTooLargeError = exports.TooManyRequestsError = exports.UnprocessableEntityError = exports.ConflictError = exports.NotFoundError = exports.ForbiddenError = exports.UnauthorizedError = exports.BadRequestError = exports.AppError = void 0;
class AppError extends Error {
    statusCode;
    code;
    details;
    expose;
    constructor(statusCode, code, message, details) {
        super(message);
        this.name = new.target.name;
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        this.expose = statusCode < 500;
        Error.captureStackTrace(this, new.target);
    }
}
exports.AppError = AppError;
class BadRequestError extends AppError {
    constructor(message = 'Permintaan tidak valid', details) {
        super(400, 'BAD_REQUEST', message, details);
    }
}
exports.BadRequestError = BadRequestError;
class UnauthorizedError extends AppError {
    constructor(message = 'Tidak terautentikasi', details) {
        super(401, 'UNAUTHORIZED', message, details);
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends AppError {
    constructor(message = 'Akses ditolak', details) {
        super(403, 'FORBIDDEN', message, details);
    }
}
exports.ForbiddenError = ForbiddenError;
class NotFoundError extends AppError {
    constructor(message = 'Data tidak ditemukan', details) {
        super(404, 'NOT_FOUND', message, details);
    }
}
exports.NotFoundError = NotFoundError;
class ConflictError extends AppError {
    constructor(message = 'Konflik data', details) {
        super(409, 'CONFLICT', message, details);
    }
}
exports.ConflictError = ConflictError;
class UnprocessableEntityError extends AppError {
    constructor(message = 'Data tidak dapat diproses', details) {
        super(422, 'UNPROCESSABLE_ENTITY', message, details);
    }
}
exports.UnprocessableEntityError = UnprocessableEntityError;
class TooManyRequestsError extends AppError {
    constructor(message = 'Terlalu banyak permintaan, coba lagi nanti', details) {
        super(429, 'TOO_MANY_REQUESTS', message, details);
    }
}
exports.TooManyRequestsError = TooManyRequestsError;
class PayloadTooLargeError extends AppError {
    constructor(message = 'File terlalu besar', details) {
        super(413, 'PAYLOAD_TOO_LARGE', message, details);
    }
}
exports.PayloadTooLargeError = PayloadTooLargeError;
//# sourceMappingURL=AppError.js.map