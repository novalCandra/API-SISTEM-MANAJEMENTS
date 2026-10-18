"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemController = void 0;
const events_1 = require("../realtime/events");
const asyncHandler_1 = require("../utils/asyncHandler");
const matchesQuery = (item, query) => {
    const needle = query.toLowerCase();
    return (item.name.toLowerCase().includes(needle) ||
        (item.sku ?? '').toLowerCase().includes(needle));
};
class ItemController {
    items;
    realtime;
    constructor(items, realtime) {
        this.items = items;
        this.realtime = realtime;
    }
    list = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const userId = req.user.sub;
        const { q } = req.query;
        let data = await this.items.list(userId);
        if (q) {
            data = data.filter((item) => matchesQuery(item, q));
        }
        res.json({ data });
    });
    get = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const item = await this.items.get(req.user.sub, req.params.id);
        res.json({ data: item });
    });
    create = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const userId = req.user.sub;
        const item = await this.items.create(userId, req.body);
        this.realtime.emitToUser(userId, events_1.SOCKET_EVENTS.stockUpdated, { item });
        this.realtime.emitToUser(userId, events_1.SOCKET_EVENTS.dashboardRefresh, {});
        res.status(201).json({ data: item });
    });
    update = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const userId = req.user.sub;
        const item = await this.items.update(userId, req.params.id, req.body);
        this.realtime.emitToUser(userId, events_1.SOCKET_EVENTS.stockUpdated, { item });
        this.realtime.emitToUser(userId, events_1.SOCKET_EVENTS.dashboardRefresh, {});
        res.json({ data: item });
    });
    remove = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const userId = req.user.sub;
        await this.items.remove(userId, req.params.id);
        this.realtime.emitToUser(userId, events_1.SOCKET_EVENTS.stockUpdated, { id: req.params.id });
        this.realtime.emitToUser(userId, events_1.SOCKET_EVENTS.dashboardRefresh, {});
        res.status(204).send();
    });
}
exports.ItemController = ItemController;
//# sourceMappingURL=item.controller.js.map