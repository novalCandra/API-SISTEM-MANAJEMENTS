"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const item_service_1 = require("./item.service");
const startOfTodayIso = () => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return start.toISOString();
};
class DashboardService {
    items;
    productions;
    users;
    constructor(items, productions, users) {
        this.items = items;
        this.productions = productions;
        this.users = users;
    }
    async snapshot(userId) {
        const since = startOfTodayIso();
        const [user, items, todayProductions] = await Promise.all([
            this.users.findById(userId),
            this.items.findAllByUser(userId),
            this.productions.findByUser(userId, { since }),
        ]);
        const output = todayProductions.reduce((sum, item) => sum + item.quantity, 0);
        const profit = todayProductions.reduce((sum, item) => sum + item.profit, 0);
        const stocks = items.map(item_service_1.toStockView);
        const lowStock = stocks.filter((stock) => stock.status !== 'AMAN');
        const dailyTarget = user?.dailyTarget ?? 0;
        const percent = dailyTarget > 0 ? Math.min(100, Math.round((output / dailyTarget) * 100)) : 0;
        return {
            target: { dailyTarget, achieved: output, percent },
            today: { output, profit, transactions: todayProductions.length },
            stocks,
            lowStock,
        };
    }
}
exports.DashboardService = DashboardService;
//# sourceMappingURL=dashboard.service.js.map