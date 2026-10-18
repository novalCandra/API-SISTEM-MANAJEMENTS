"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.itemListQuerySchema = exports.itemUpdateSchema = exports.itemBodySchema = void 0;
const zod_1 = require("zod");
const money = zod_1.z.coerce.number().finite().min(0, 'Harga tidak boleh negatif').max(1_000_000_000_000);
const quantity = zod_1.z.coerce.number().int('Harus bilangan bulat').min(0, 'Tidak boleh negatif').max(1_000_000_000);
exports.itemBodySchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(1, 'Nama barang wajib diisi').max(120),
    sku: zod_1.z.string().trim().max(60).optional().nullable(),
    unit: zod_1.z.string().trim().min(1, 'Satuan wajib diisi').max(20),
    stock: quantity,
    minStock: quantity,
    cost: money,
    price: money,
});
exports.itemUpdateSchema = exports.itemBodySchema.partial();
exports.itemListQuerySchema = zod_1.z.object({
    q: zod_1.z.string().trim().max(80).optional(),
});
//# sourceMappingURL=item.schema.js.map