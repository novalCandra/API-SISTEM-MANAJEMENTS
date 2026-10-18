"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalStorageProvider = void 0;
const promises_1 = require("node:fs/promises");
const node_path_1 = __importDefault(require("node:path"));
const env_1 = require("../config/env");
const id_1 = require("../utils/id");
class LocalStorageProvider {
    root;
    constructor(root = env_1.config.UPLOAD_DIR) {
        this.root = node_path_1.default.resolve(root);
    }
    resolveSafe(relativePath) {
        const target = node_path_1.default.resolve(this.root, relativePath);
        if (target !== this.root && !target.startsWith(this.root + node_path_1.default.sep)) {
            throw new Error('Path traversal detected');
        }
        return target;
    }
    async save(buffer, options) {
        const filename = `${(0, id_1.newId)()}.${options.extension}`;
        const relativePath = node_path_1.default.posix.join(options.userId, filename);
        const absolute = this.resolveSafe(relativePath);
        await (0, promises_1.mkdir)(node_path_1.default.dirname(absolute), { recursive: true });
        await (0, promises_1.writeFile)(absolute, buffer);
        return { path: relativePath, url: this.buildUrl(relativePath) };
    }
    async remove(relativePath) {
        try {
            await (0, promises_1.unlink)(this.resolveSafe(relativePath));
        }
        catch {
            return;
        }
    }
    async getUrl(relativePath) {
        return this.buildUrl(relativePath);
    }
    buildUrl(relativePath) {
        return `${env_1.config.PUBLIC_BASE_URL.replace(/\/$/, '')}/uploads/${relativePath}`;
    }
}
exports.LocalStorageProvider = LocalStorageProvider;
//# sourceMappingURL=LocalStorageProvider.js.map