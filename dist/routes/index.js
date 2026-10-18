"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDashboardRouter = createDashboardRouter;
exports.createApiRouter = createApiRouter;
const express_1 = require("express");
const auth_routes_1 = require("./auth.routes");
const item_routes_1 = require("./item.routes");
const note_routes_1 = require("./note.routes");
const photo_routes_1 = require("./photo.routes");
const production_routes_1 = require("./production.routes");
function createDashboardRouter(container) {
    const router = (0, express_1.Router)();
    router.get('/', container.controllers.dashboard.snapshot);
    return router;
}
function createApiRouter(container) {
    const router = (0, express_1.Router)();
    const { requireAuth } = container;
    router.get('/health', (_req, res) => {
        res.json({ data: { status: 'ok', uptime: process.uptime() } });
    });
    router.use('/auth', (0, auth_routes_1.createAuthRouter)(container.controllers.auth, requireAuth));
    router.use('/items', requireAuth, (0, item_routes_1.createItemRouter)(container.controllers.items));
    router.use('/productions', requireAuth, (0, production_routes_1.createProductionRouter)(container.controllers.productions));
    router.use('/photos', requireAuth, (0, photo_routes_1.createPhotoRouter)(container.controllers.photos));
    router.use('/notes', requireAuth, (0, note_routes_1.createNoteRouter)(container.controllers.notes));
    router.use('/dashboard', requireAuth, createDashboardRouter(container));
    return router;
}
//# sourceMappingURL=index.js.map