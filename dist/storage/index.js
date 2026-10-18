"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStorageProvider = createStorageProvider;
const env_1 = require("../config/env");
const FirebaseStorageProvider_1 = require("./FirebaseStorageProvider");
const LocalStorageProvider_1 = require("./LocalStorageProvider");
function createStorageProvider() {
    if (env_1.config.STORAGE_DRIVER === 'firebase') {
        return new FirebaseStorageProvider_1.FirebaseStorageProvider();
    }
    return new LocalStorageProvider_1.LocalStorageProvider();
}
//# sourceMappingURL=index.js.map