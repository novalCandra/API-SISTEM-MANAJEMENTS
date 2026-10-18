"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPhotoRouter = createPhotoRouter;
const express_1 = require("express");
const rateLimit_1 = require("../middleware/rateLimit");
const upload_1 = require("../middleware/upload");
const validate_1 = require("../middleware/validate");
const auth_schema_1 = require("../schemas/auth.schema");
const photo_schema_1 = require("../schemas/photo.schema");
function createPhotoRouter(controller) {
    const router = (0, express_1.Router)();
    router.get('/', controller.list);
    router.post('/', rateLimit_1.uploadLimiter, upload_1.singlePhoto, (0, validate_1.validate)({ body: photo_schema_1.photoBodySchema }), controller.upload);
    router.delete('/:id', (0, validate_1.validate)({ params: auth_schema_1.idParamSchema }), controller.remove);
    return router;
}
//# sourceMappingURL=photo.routes.js.map