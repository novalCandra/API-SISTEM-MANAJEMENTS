"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readRefreshCookie = exports.clearRefreshCookie = exports.setRefreshCookie = void 0;
const env_1 = require("../config/env");
const baseCookieOptions = {
    httpOnly: true,
    secure: env_1.config.COOKIE_SECURE,
    sameSite: env_1.config.COOKIE_SAMESITE,
    domain: env_1.config.COOKIE_DOMAIN || undefined,
    path: '/api/auth',
};
const setRefreshCookie = (res, token, expiresAt) => {
    res.cookie(env_1.config.COOKIE_NAME, token, { ...baseCookieOptions, expires: new Date(expiresAt) });
};
exports.setRefreshCookie = setRefreshCookie;
const clearRefreshCookie = (res) => {
    res.clearCookie(env_1.config.COOKIE_NAME, baseCookieOptions);
};
exports.clearRefreshCookie = clearRefreshCookie;
const readRefreshCookie = (req) => {
    const cookies = req.cookies;
    return cookies?.[env_1.config.COOKIE_NAME] ?? null;
};
exports.readRefreshCookie = readRefreshCookie;
//# sourceMappingURL=cookies.js.map