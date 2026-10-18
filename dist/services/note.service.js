"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoteService = void 0;
const AppError_1 = require("../errors/AppError");
const id_1 = require("../utils/id");
class NoteService {
    notes;
    constructor(notes) {
        this.notes = notes;
    }
    async list(userId) {
        return this.notes.findByUser(userId);
    }
    async create(userId, input) {
        const now = new Date().toISOString();
        const note = {
            id: (0, id_1.newId)(),
            userId,
            title: input.title.trim(),
            content: input.content.trim(),
            createdAt: now,
            updatedAt: now,
        };
        return this.notes.create(note);
    }
    async update(userId, id, input) {
        const updated = await this.notes.update(userId, id, {
            ...(input.title !== undefined ? { title: input.title.trim() } : {}),
            ...(input.content !== undefined ? { content: input.content.trim() } : {}),
            updatedAt: new Date().toISOString(),
        });
        if (!updated) {
            throw new AppError_1.NotFoundError('Catatan tidak ditemukan');
        }
        return updated;
    }
    async remove(userId, id) {
        const removed = await this.notes.remove(userId, id);
        if (!removed) {
            throw new AppError_1.NotFoundError('Catatan tidak ditemukan');
        }
    }
}
exports.NoteService = NoteService;
//# sourceMappingURL=note.service.js.map