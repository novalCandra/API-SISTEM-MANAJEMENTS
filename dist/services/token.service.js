"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenService = void 0;
const node_crypto_1 = require("node:crypto");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const AppError_1 = require("../errors/AppError");
class TokenService {
    signAccessToken(user) {
        const payload = { sub: user.id, email: user.email, type: 'access' };
        return jsonwebtoken_1.default.sign(payload, env_1.config.JWT_ACCESS_SECRET, {
            algorithm: 'HS256',
            expiresIn: env_1.config.JWT_ACCESS_TTL,
        });
    }
    verifyAccessToken(token) {
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(token, env_1.config.JWT_ACCESS_SECRET, { algorithms: ['HS256'] });
        }
        catch {
            throw new AppError_1.UnauthorizedError('Sesi berakhir, silakan masuk kembali');
        }
        if (typeof decoded !== 'object' || decoded === null) {
            throw new AppError_1.UnauthorizedError('Token tidak valid');
        }
        const payload = decoded;
        if (payload.type !== 'access' || typeof payload.sub !== 'string') {
            throw new AppError_1.UnauthorizedError('Token tidak valid');
        }
        return { sub: payload.sub, email: String(payload.email ?? ''), type: 'access' };
    }
    createRefreshToken(userId) {
        const jti = (0, node_crypto_1.randomUUID)();
        const token = jsonwebtoken_1.default.sign({ sub: userId, jti, type: 'refresh' }, env_1.config.JWT_REFRESH_SECRET, {
            algorithm: 'HS256',
            expiresIn: env_1.config.JWT_REFRESH_TTL,
        });
        const decoded = jsonwebtoken_1.default.decode(token);
        const expiresAt = decoded?.exp ? decoded.exp * 1000 : Date.now() + 7 * 24 * 60 * 60 * 1000;
        return { token, jti, expiresAt };
    }
    verifyRefreshToken(token) {
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(token, env_1.config.JWT_REFRESH_SECRET, { algorithms: ['HS256'] });
        }
        catch {
            throw new AppError_1.UnauthorizedError('Sesi berakhir, silakan masuk kembali');
        }
        if (typeof decoded !== 'object' || decoded === null) {
            throw new AppError_1.UnauthorizedError('Token tidak valid');
        }
        const payload = decoded;
        if (payload.type !== 'refresh' || typeof payload.sub !== 'string' || typeof payload.jti !== 'string') {
            throw new AppError_1.UnauthorizedError('Token tidak valid');
        }
        return { sub: payload.sub, jti: payload.jti, type: 'refresh' };
    }
    hashToken(token) {
        return (0, node_crypto_1.createHash)('sha256').update(token).digest('hex');
    }
}
exports.TokenService = TokenService;
//# sourceMappingURL=token.service.js.map