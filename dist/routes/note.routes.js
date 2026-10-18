"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNoteRouter = createNoteRouter;
const express_1 = require("express");
const validate_1 = require("../middleware/validate");
const auth_schema_1 = require("../schemas/auth.schema");
const note_schema_1 = require("../schemas/note.schema");
function createNoteRouter(controller) {
    const router = (0, express_1.Router)();
    router.get('/', controller.list);
    router.post('/', (0, validate_1.validate)({ body: note_schema_1.noteBodySchema }), controller.create);
    router.patch('/:id', (0, validate_1.validate)({ params: auth_schema_1.idParamSchema, body: note_schema_1.noteUpdateSchema }), controller.update);
    router.delete('/:id', (0, validate_1.validate)({ params: auth_schema_1.idParamSchema }), controller.remove);
    return router;
}
//# sourceMappingURL=note.routes.js.map