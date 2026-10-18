"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuthRouter = createAuthRouter;
const express_1 = require("express");
const rateLimit_1 = require("../middleware/rateLimit");
const validate_1 = require("../middleware/validate");
const auth_schema_1 = require("../schemas/auth.schema");
function createAuthRouter(controller, requireAuth) {
    const router = (0, express_1.Router)();
    router.post('/register', rateLimit_1.loginLimiter, (0, validate_1.validate)({ body: auth_schema_1.registerSchema }), controller.register);
    router.post('/login', rateLimit_1.loginLimiter, (0, validate_1.validate)({ body: auth_schema_1.loginSchema }), controller.login);
    router.post('/refresh', controller.refresh);
    router.post('/logout', controller.logout);
    router.get('/me', requireAuth, controller.me);
    return router;
}
//# sourceMappingURL=auth.routes.js.map