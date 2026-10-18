"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.idParamSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    email: zod_1.z.string().trim().email('Email tidak valid').max(254),
    password: zod_1.z.string().min(8, 'Kata sandi minimal 8 karakter').max(128),
    name: zod_1.z.string().trim().min(1, 'Nama wajib diisi').max(80),
    businessName: zod_1.z.string().trim().min(1, 'Nama usaha wajib diisi').max(80),
    dailyTarget: zod_1.z.coerce.number().int().min(0, 'Target tidak boleh negatif').max(1_000_000).optional(),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().trim().email('Email tidak valid').max(254),
    password: zod_1.z.string().min(1, 'Kata sandi wajib diisi').max(128),
});
exports.idParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('ID tidak valid'),
});
//# sourceMappingURL=auth.schema.js.map