"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
class DashboardController {
    dashboard;
    constructor(dashboard) {
        this.dashboard = dashboard;
    }
    snapshot = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const data = await this.dashboard.snapshot(req.user.sub);
        res.json({ data });
    });
}
exports.DashboardController = DashboardController;
//# sourceMappingURL=dashboard.controller.js.map