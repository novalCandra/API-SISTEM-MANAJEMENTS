"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const AppError_1 = require("../errors/AppError");
const asyncHandler_1 = require("../utils/asyncHandler");
const cookies_1 = require("../utils/cookies");
class AuthController {
    auth;
    constructor(auth) {
        this.auth = auth;
    }
    register = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { user, tokens } = await this.auth.register(req.body);
        (0, cookies_1.setRefreshCookie)(res, tokens.refreshToken, tokens.refreshExpiresAt);
        res.status(201).json({ data: { user, accessToken: tokens.accessToken } });
    });
    login = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { email, password } = req.body;
        const { user, tokens } = await this.auth.login(email, password);
        (0, cookies_1.setRefreshCookie)(res, tokens.refreshToken, tokens.refreshExpiresAt);
        res.json({ data: { user, accessToken: tokens.accessToken } });
    });
    refresh = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const refreshToken = (0, cookies_1.readRefreshCookie)(req);
        if (!refreshToken) {
            throw new AppError_1.UnauthorizedError('Sesi berakhir, silakan masuk kembali');
        }
        const { user, tokens } = await this.auth.refresh(refreshToken);
        (0, cookies_1.setRefreshCookie)(res, tokens.refreshToken, tokens.refreshExpiresAt);
        res.json({ data: { user, accessToken: tokens.accessToken } });
    });
    logout = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        await this.auth.logout((0, cookies_1.readRefreshCookie)(req));
        (0, cookies_1.clearRefreshCookie)(res);
        res.status(204).send();
    });
    me = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const user = await this.auth.me(req.user.sub);
        res.json({ data: { user } });
    });
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map