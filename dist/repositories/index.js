"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRepositories = createRepositories;
const env_1 = require("../config/env");
const repositories_1 = require("./memory/repositories");
const repositories_2 = require("./firestore/repositories");
const repositories_3 = require("./rtdb/repositories");
function createRepositories() {
    if (env_1.config.DB_DRIVER === 'firestore') {
        return {
            users: new repositories_2.FirestoreUserRepository(),
            items: new repositories_2.FirestoreItemRepository(),
            productions: new repositories_2.FirestoreProductionRepository(),
            photos: new repositories_2.FirestorePhotoRepository(),
            notes: new repositories_2.FirestoreNoteRepository(),
            refreshTokens: new repositories_2.FirestoreRefreshTokenRepository(),
        };
    }
    if (env_1.config.DB_DRIVER === 'rtdb') {
        return {
            users: new repositories_3.RtdbUserRepository(),
            items: new repositories_3.RtdbItemRepository(),
            productions: new repositories_3.RtdbProductionRepository(),
            photos: new repositories_3.RtdbPhotoRepository(),
            notes: new repositories_3.RtdbNoteRepository(),
            refreshTokens: new repositories_3.RtdbRefreshTokenRepository(),
        };
    }
    const store = new repositories_1.MemoryStore();
    return {
        users: new repositories_1.MemoryUserRepository(store),
        items: new repositories_1.MemoryItemRepository(store),
        productions: new repositories_1.MemoryProductionRepository(store),
        photos: new repositories_1.MemoryPhotoRepository(store),
        notes: new repositories_1.MemoryNoteRepository(store),
        refreshTokens: new repositories_1.MemoryRefreshTokenRepository(store),
        store,
    };
}
//# sourceMappingURL=index.js.map