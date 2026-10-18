"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoteController = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
class NoteController {
    notes;
    constructor(notes) {
        this.notes = notes;
    }
    list = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const data = await this.notes.list(req.user.sub);
        res.json({ data });
    });
    create = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const note = await this.notes.create(req.user.sub, req.body);
        res.status(201).json({ data: note });
    });
    update = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const note = await this.notes.update(req.user.sub, req.params.id, req.body);
        res.json({ data: note });
    });
    remove = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        await this.notes.remove(req.user.sub, req.params.id);
        res.status(204).send();
    });
}
exports.NoteController = NoteController;
//# sourceMappingURL=note.controller.js.map