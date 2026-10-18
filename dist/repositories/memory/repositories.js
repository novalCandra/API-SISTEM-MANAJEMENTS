"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryRefreshTokenRepository = exports.MemoryNoteRepository = exports.MemoryPhotoRepository = exports.MemoryProductionRepository = exports.MemoryItemRepository = exports.MemoryUserRepository = exports.MemoryStore = void 0;
const clone = (value) => JSON.parse(JSON.stringify(value));
class MemoryStore {
    users = new Map();
    items = new Map();
    productions = new Map();
    photos = new Map();
    notes = new Map();
    refreshTokens = new Map();
    reset() {
        this.users.clear();
        this.items.clear();
        this.productions.clear();
        this.photos.clear();
        this.notes.clear();
        this.refreshTokens.clear();
    }
}
exports.MemoryStore = MemoryStore;
class MemoryUserRepository {
    store;
    constructor(store) {
        this.store = store;
    }
    async findById(id) {
        const user = this.store.users.get(id);
        return user ? clone(user) : null;
    }
    async findByEmail(email) {
        const normalized = email.trim().toLowerCase();
        for (const user of this.store.users.values()) {
            if (user.email === normalized)
                return clone(user);
        }
        return null;
    }
    async create(user) {
        this.store.users.set(user.id, clone(user));
        return clone(user);
    }
    async update(id, patch) {
        const current = this.store.users.get(id);
        if (!current)
            return null;
        const next = { ...current, ...patch, id: current.id };
        this.store.users.set(id, next);
        return clone(next);
    }
}
exports.MemoryUserRepository = MemoryUserRepository;
class MemoryItemRepository {
    store;
    constructor(store) {
        this.store = store;
    }
    async findAllByUser(userId) {
        return [...this.store.items.values()]
            .filter((item) => item.userId === userId)
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(clone);
    }
    async findById(userId, id) {
        const item = this.store.items.get(id);
        if (!item || item.userId !== userId)
            return null;
        return clone(item);
    }
    async create(item) {
        this.store.items.set(item.id, clone(item));
        return clone(item);
    }
    async update(userId, id, patch) {
        const current = this.store.items.get(id);
        if (!current || current.userId !== userId)
            return null;
        const next = { ...current, ...patch, id: current.id, userId: current.userId };
        this.store.items.set(id, next);
        return clone(next);
    }
    async remove(userId, id) {
        const current = this.store.items.get(id);
        if (!current || current.userId !== userId)
            return false;
        return this.store.items.delete(id);
    }
}
exports.MemoryItemRepository = MemoryItemRepository;
class MemoryProductionRepository {
    store;
    constructor(store) {
        this.store = store;
    }
    async findByUser(userId, options) {
        return [...this.store.productions.values()]
            .filter((p) => p.userId === userId)
            .filter((p) => (options?.since ? p.createdAt >= options.since : true))
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
            .map(clone);
    }
    async findById(userId, id) {
        const found = this.store.productions.get(id);
        if (!found || found.userId !== userId)
            return null;
        return clone(found);
    }
    async create(production) {
        this.store.productions.set(production.id, clone(production));
        return clone(production);
    }
}
exports.MemoryProductionRepository = MemoryProductionRepository;
class MemoryPhotoRepository {
    store;
    constructor(store) {
        this.store = store;
    }
    async findByUser(userId) {
        return [...this.store.photos.values()]
            .filter((photo) => photo.userId === userId)
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
            .map(clone);
    }
    async findById(userId, id) {
        const found = this.store.photos.get(id);
        if (!found || found.userId !== userId)
            return null;
        return clone(found);
    }
    async create(photo) {
        this.store.photos.set(photo.id, clone(photo));
        return clone(photo);
    }
    async remove(userId, id) {
        const found = this.store.photos.get(id);
        if (!found || found.userId !== userId)
            return false;
        return this.store.photos.delete(id);
    }
}
exports.MemoryPhotoRepository = MemoryPhotoRepository;
class MemoryNoteRepository {
    store;
    constructor(store) {
        this.store = store;
    }
    async findByUser(userId) {
        return [...this.store.notes.values()]
            .filter((note) => note.userId === userId)
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
            .map(clone);
    }
    async findById(userId, id) {
        const found = this.store.notes.get(id);
        if (!found || found.userId !== userId)
            return null;
        return clone(found);
    }
    async create(note) {
        this.store.notes.set(note.id, clone(note));
        return clone(note);
    }
    async update(userId, id, patch) {
        const current = this.store.notes.get(id);
        if (!current || current.userId !== userId)
            return null;
        const next = { ...current, ...patch, id: current.id, userId: current.userId };
        this.store.notes.set(id, next);
        return clone(next);
    }
    async remove(userId, id) {
        const found = this.store.notes.get(id);
        if (!found || found.userId !== userId)
            return false;
        return this.store.notes.delete(id);
    }
}
exports.MemoryNoteRepository = MemoryNoteRepository;
class MemoryRefreshTokenRepository {
    store;
    constructor(store) {
        this.store = store;
    }
    async create(record) {
        this.store.refreshTokens.set(record.id, clone(record));
        return clone(record);
    }
    async findById(id) {
        const found = this.store.refreshTokens.get(id);
        return found ? clone(found) : null;
    }
    async revoke(id, replacedBy = null) {
        const found = this.store.refreshTokens.get(id);
        if (!found)
            return;
        found.revokedAt = new Date().toISOString();
        found.replacedBy = replacedBy;
        this.store.refreshTokens.set(id, found);
    }
    async revokeAllForUser(userId) {
        for (const record of this.store.refreshTokens.values()) {
            if (record.userId === userId && !record.revokedAt) {
                record.revokedAt = new Date().toISOString();
            }
        }
    }
}
exports.MemoryRefreshTokenRepository = MemoryRefreshTokenRepository;
//# sourceMappingURL=repositories.js.map