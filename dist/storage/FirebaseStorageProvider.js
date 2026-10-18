"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirebaseStorageProvider = void 0;
const firebase_1 = require("../config/firebase");
const id_1 = require("../utils/id");
const SIGNED_URL_TTL_MS = 7 * 24 * 60 * 60 * 1000;
class FirebaseStorageProvider {
    prefix = 'photos';
    async save(buffer, options) {
        const filename = `${(0, id_1.newId)()}.${options.extension}`;
        const storagePath = `${this.prefix}/${options.userId}/${filename}`;
        const file = (0, firebase_1.getStorageBucket)().bucket().file(storagePath);
        await file.save(buffer, {
            resumable: false,
            contentType: options.contentType,
            metadata: { cacheControl: 'private, max-age=0, no-transform' },
            preconditionOpts: { ifGenerationMatch: 0 },
        });
        const url = await this.getUrl(storagePath);
        return { path: storagePath, url };
    }
    async remove(storagePath) {
        try {
            await (0, firebase_1.getStorageBucket)().bucket().file(storagePath).delete();
        }
        catch {
            return;
        }
    }
    async getUrl(storagePath) {
        const [url] = await (0, firebase_1.getStorageBucket)().bucket().file(storagePath).getSignedUrl({
            action: 'read',
            version: 'v4',
            expires: Date.now() + SIGNED_URL_TTL_MS,
        });
        return url;
    }
}
exports.FirebaseStorageProvider = FirebaseStorageProvider;
//# sourceMappingURL=FirebaseStorageProvider.js.map