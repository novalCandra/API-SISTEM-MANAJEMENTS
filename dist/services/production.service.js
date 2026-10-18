"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductionService = void 0;
const AppError_1 = require("../errors/AppError");
const id_1 = require("../utils/id");
const item_service_1 = require("./item.service");
class ProductionService {
    items;
    productions;
    constructor(items, productions) {
        this.items = items;
        this.productions = productions;
    }
    async list(userId, options) {
        return this.productions.findByUser(userId, options);
    }
    async create(userId, input) {
        const item = await this.items.findById(userId, input.itemId);
        if (!item) {
            throw new AppError_1.NotFoundError('Barang tidak ditemukan');
        }
        const quantity = Math.floor(input.quantity);
        const profit = (item.price - item.cost) * quantity;
        const production = {
            id: (0, id_1.newId)(),
            userId,
            itemId: item.id,
            itemName: item.name,
            quantity,
            worker: input.worker.trim(),
            note: input.note?.trim() || null,
            unitCost: item.cost,
            unitPrice: item.price,
            profit,
            createdAt: new Date().toISOString(),
        };
        await this.productions.create(production);
        const updated = await this.items.update(userId, item.id, {
            stock: item.stock + quantity,
            updatedAt: new Date().toISOString(),
        });
        if (!updated) {
            throw new AppError_1.NotFoundError('Barang tidak ditemukan');
        }
        return { production, item: (0, item_service_1.toStockView)(updated) };
    }
}
exports.ProductionService = ProductionService;
//# sourceMappingURL=production.service.js.map