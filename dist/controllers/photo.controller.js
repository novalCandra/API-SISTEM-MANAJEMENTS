"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhotoController = void 0;
const AppError_1 = require("../errors/AppError");
const events_1 = require("../realtime/events");
const asyncHandler_1 = require("../utils/asyncHandler");
class PhotoController {
    photos;
    realtime;
    constructor(photos, realtime) {
        this.photos = photos;
        this.realtime = realtime;
    }
    list = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const data = await this.photos.list(req.user.sub);
        res.json({ data });
    });
    upload = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const userId = req.user.sub;
        const file = req.file;
        if (!file) {
            throw new AppError_1.BadRequestError('Foto wajib diunggah');
        }
        const body = req.body;
        const photo = await this.photos.upload(userId, {
            buffer: file.buffer,
            itemId: body.itemId ?? null,
            itemName: body.itemName,
            quantity: body.quantity,
            worker: body.worker,
        });
        this.realtime.emitToUser(userId, events_1.SOCKET_EVENTS.photoCreated, { photo });
        this.realtime.emitToUser(userId, events_1.SOCKET_EVENTS.dashboardRefresh, {});
        res.status(201).json({ data: photo });
    });
    remove = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        await this.photos.remove(req.user.sub, req.params.id);
        res.status(204).send();
    });
}
exports.PhotoController = PhotoController;
//# sourceMappingURL=photo.controller.js.map