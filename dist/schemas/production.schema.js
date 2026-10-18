"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productionQuerySchema = exports.productionBodySchema = void 0;
const zod_1 = require("zod");
exports.productionBodySchema = zod_1.z.object({
    itemId: zod_1.z.string().uuid('Barang tidak valid'),
    quantity: zod_1.z.coerce.number().int('Harus bilangan bulat').positive('Jumlah harus lebih dari 0').max(1_000_000),
    worker: zod_1.z.string().trim().min(1, 'Nama pekerja wajib diisi').max(80),
    note: zod_1.z.string().trim().max(500).optional().nullable(),
});
exports.productionQuerySchema = zod_1.z.object({
    since: zod_1.z.string().datetime({ offset: true }).optional(),
});
//# sourceMappingURL=production.schema.js.map