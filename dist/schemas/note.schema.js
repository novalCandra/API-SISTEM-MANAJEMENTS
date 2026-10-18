"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.noteUpdateSchema = exports.noteBodySchema = void 0;
const zod_1 = require("zod");
exports.noteBodySchema = zod_1.z.object({
    title: zod_1.z.string().trim().min(1, 'Judul wajib diisi').max(120),
    content: zod_1.z.string().trim().min(1, 'Isi catatan wajib diisi').max(5000),
});
exports.noteUpdateSchema = exports.noteBodySchema.partial();
//# sourceMappingURL=note.schema.js.map