"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.photoBodySchema = void 0;
const zod_1 = require("zod");
exports.photoBodySchema = zod_1.z.object({
    itemId: zod_1.z.preprocess((value) => (value === '' || value === undefined || value === null ? undefined : value), zod_1.z.string().uuid('Barang tidak valid').optional()),
    itemName: zod_1.z.preprocess((value) => (value === '' || value === undefined || value === null ? undefined : value), zod_1.z.string().trim().max(120).optional()),
    quantity: zod_1.z.coerce.number().int('Harus bilangan bulat').min(0).max(1_000_000),
    worker: zod_1.z.string().trim().min(1, 'Nama pekerja wajib diisi').max(80),
});
//# sourceMappingURL=photo.schema.js.map