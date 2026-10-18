"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductionController = void 0;
const events_1 = require("../realtime/events");
const asyncHandler_1 = require("../utils/asyncHandler");
class ProductionController {
    productions;
    realtime;
    constructor(productions, realtime) {
        this.productions = productions;
        this.realtime = realtime;
    }
    list = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { since } = req.query;
        const data = await this.productions.list(req.user.sub, since ? { since } : undefined);
        res.json({ data });
    });
    create = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const userId = req.user.sub;
        const { production, item } = await this.productions.create(userId, req.body);
        this.realtime.emitToUser(userId, events_1.SOCKET_EVENTS.productionCreated, { production });
        this.realtime.emitToUser(userId, events_1.SOCKET_EVENTS.stockUpdated, { item });
        this.realtime.emitToUser(userId, events_1.SOCKET_EVENTS.dashboardRefresh, {});
        res.status(201).json({ data: { production, item } });
    });
}
exports.ProductionController = ProductionController;
//# sourceMappingURL=production.controller.js.map