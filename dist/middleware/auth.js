"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuthMiddleware = createAuthMiddleware;
const AppError_1 = require("../errors/AppError");
function createAuthMiddleware(tokens, logger) {
    return (req, _res, next) => {
        const header = req.headers.authorization;
        if (!header || !header.startsWith('Bearer ')) {
            logger.warn({ requestId: req.id, path: req.path }, 'access denied: missing bearer token');
            throw new AppError_1.UnauthorizedError('Tidak terautentikasi');
        }
        const token = header.slice('Bearer '.length).trim();
        const payload = tokens.verifyAccessToken(token);
        req.user = payload;
        next();
    };
}
//# sourceMappingURL=auth.js.map