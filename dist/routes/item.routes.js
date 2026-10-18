"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createItemRouter = createItemRouter;
const express_1 = require("express");
const validate_1 = require("../middleware/validate");
const auth_schema_1 = require("../schemas/auth.schema");
const item_schema_1 = require("../schemas/item.schema");
function createItemRouter(controller) {
    const router = (0, express_1.Router)();
    router.get('/', (0, validate_1.validate)({ query: item_schema_1.itemListQuerySchema }), controller.list);
    router.post('/', (0, validate_1.validate)({ body: item_schema_1.itemBodySchema }), controller.create);
    router.get('/:id', (0, validate_1.validate)({ params: auth_schema_1.idParamSchema }), controller.get);
    router.patch('/:id', (0, validate_1.validate)({ params: auth_schema_1.idParamSchema, body: item_schema_1.itemUpdateSchema }), controller.update);
    router.delete('/:id', (0, validate_1.validate)({ params: auth_schema_1.idParamSchema }), controller.remove);
    return router;
}
//# sourceMappingURL=item.routes.js.map