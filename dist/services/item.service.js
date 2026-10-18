"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemService = exports.toStockView = void 0;
const AppError_1 = require("../errors/AppError");
const id_1 = require("../utils/id");
const stock_1 = require("../utils/stock");
const toStockView = (item) => ({
    ...item,
    status: (0, stock_1.computeStockStatus)(item),
});
exports.toStockView = toStockView;
class ItemService {
    items;
    constructor(items) {
        this.items = items;
    }
    async list(userId) {
        const items = await this.items.findAllByUser(userId);
        return items.map(exports.toStockView);
    }
    async get(userId, id) {
        const item = await this.items.findById(userId, id);
        if (!item) {
            throw new AppError_1.NotFoundError('Barang tidak ditemukan');
        }
        return item;
    }
    async create(userId, input) {
        this.assertBusinessRules(input);
        const now = new Date().toISOString();
        const item = {
            id: (0, id_1.newId)(),
            userId,
            name: input.name.trim(),
            sku: input.sku?.trim() || null,
            unit: input.unit.trim(),
            stock: input.stock,
            minStock: input.minStock,
            cost: input.cost,
            price: input.price,
            createdAt: now,
            updatedAt: now,
        };
        const created = await this.items.create(item);
        return (0, exports.toStockView)(created);
    }
    async update(userId, id, input) {
        const current = await this.items.findById(userId, id);
        if (!current) {
            throw new AppError_1.NotFoundError('Barang tidak ditemukan');
        }
        if (input.stock !== undefined && input.stock < 0) {
            throw new AppError_1.UnprocessableEntityError('Stok tidak boleh kurang dari 0');
        }
        if (input.minStock !== undefined && input.minStock < 0) {
            throw new AppError_1.UnprocessableEntityError('Stok minimum tidak boleh kurang dari 0');
        }
        if (input.cost !== undefined && input.cost < 0) {
            throw new AppError_1.UnprocessableEntityError('Harga modal tidak boleh negatif');
        }
        if (input.price !== undefined && input.price < 0) {
            throw new AppError_1.UnprocessableEntityError('Harga jual tidak boleh negatif');
        }
        const updated = await this.items.update(userId, id, {
            ...(input.name !== undefined ? { name: input.name.trim() } : {}),
            ...(input.sku !== undefined ? { sku: input.sku?.trim() || null } : {}),
            ...(input.unit !== undefined ? { unit: input.unit.trim() } : {}),
            ...(input.stock !== undefined ? { stock: input.stock } : {}),
            ...(input.minStock !== undefined ? { minStock: input.minStock } : {}),
            ...(input.cost !== undefined ? { cost: input.cost } : {}),
            ...(input.price !== undefined ? { price: input.price } : {}),
            updatedAt: new Date().toISOString(),
        });
        if (!updated) {
            throw new AppError_1.NotFoundError('Barang tidak ditemukan');
        }
        return (0, exports.toStockView)(updated);
    }
    async remove(userId, id) {
        const removed = await this.items.remove(userId, id);
        if (!removed) {
            throw new AppError_1.NotFoundError('Barang tidak ditemukan');
        }
    }
    async incrementStock(userId, id, delta) {
        const current = await this.get(userId, id);
        const nextStock = current.stock + delta;
        if (nextStock < 0) {
            throw new AppError_1.UnprocessableEntityError('Stok tidak boleh kurang dari 0');
        }
        const updated = await this.items.update(userId, id, {
            stock: nextStock,
            updatedAt: new Date().toISOString(),
        });
        if (!updated) {
            throw new AppError_1.NotFoundError('Barang tidak ditemukan');
        }
        return (0, exports.toStockView)(updated);
    }
    assertBusinessRules(input) {
        if (input.stock < 0) {
            throw new AppError_1.UnprocessableEntityError('Stok tidak boleh kurang dari 0');
        }
        if (input.minStock < 0) {
            throw new AppError_1.UnprocessableEntityError('Stok minimum tidak boleh kurang dari 0');
        }
        if (input.cost < 0 || input.price < 0) {
            throw new AppError_1.UnprocessableEntityError('Harga tidak boleh negatif');
        }
    }
}
exports.ItemService = ItemService;
//# sourceMappingURL=item.service.js.map