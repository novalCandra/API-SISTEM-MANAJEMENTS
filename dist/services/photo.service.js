"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhotoService = void 0;
const AppError_1 = require("../errors/AppError");
const id_1 = require("../utils/id");
class PhotoService {
    photos;
    items;
    storage;
    processor;
    constructor(photos, items, storage, processor) {
        this.photos = photos;
        this.items = items;
        this.storage = storage;
        this.processor = processor;
    }
    async list(userId) {
        const photos = await this.photos.findByUser(userId);
        return Promise.all(photos.map(async (photo) => ({
            ...photo,
            url: await this.storage.getUrl(photo.path),
        })));
    }
    async upload(userId, input) {
        let itemName = input.itemName?.trim() ?? '';
        if (input.itemId) {
            const item = await this.items.findById(userId, input.itemId);
            if (!item) {
                throw new AppError_1.NotFoundError('Barang tidak ditemukan');
            }
            itemName = item.name;
        }
        if (!itemName) {
            throw new AppError_1.UnprocessableEntityError('Nama produk wajib diisi');
        }
        const processed = await this.processor.process(input.buffer);
        const stored = await this.storage.save(processed.buffer, {
            contentType: processed.contentType,
            extension: processed.extension,
            userId,
        });
        const photo = {
            id: (0, id_1.newId)(),
            userId,
            itemId: input.itemId ?? null,
            itemName,
            quantity: Math.floor(input.quantity),
            worker: input.worker.trim(),
            url: stored.url,
            path: stored.path,
            createdAt: new Date().toISOString(),
        };
        return this.photos.create(photo);
    }
    async remove(userId, id) {
        const photo = await this.photos.findById(userId, id);
        if (!photo) {
            throw new AppError_1.NotFoundError('Foto tidak ditemukan');
        }
        await this.storage.remove(photo.path);
        await this.photos.remove(userId, id);
    }
}
exports.PhotoService = PhotoService;
//# sourceMappingURL=photo.service.js.map