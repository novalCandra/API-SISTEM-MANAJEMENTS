"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProductionRouter = createProductionRouter;
const express_1 = require("express");
const validate_1 = require("../middleware/validate");
const production_schema_1 = require("../schemas/production.schema");
function createProductionRouter(controller) {
    const router = (0, express_1.Router)();
    router.get('/', (0, validate_1.validate)({ query: production_schema_1.productionQuerySchema }), controller.list);
    router.post('/', (0, validate_1.validate)({ body: production_schema_1.productionBodySchema }), controller.create);
    return router;
}
//# sourceMappingURL=production.routes.js.map