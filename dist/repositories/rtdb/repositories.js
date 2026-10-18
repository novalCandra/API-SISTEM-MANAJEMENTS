"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RtdbRefreshTokenRepository = exports.RtdbNoteRepository = exports.RtdbPhotoRepository = exports.RtdbProductionRepository = exports.RtdbItemRepository = exports.RtdbUserRepository = void 0;
const firebase_1 = require("../../config/firebase");
const AppError_1 = require("../../errors/AppError");
const SEGMENT = /^[A-Za-z0-9_-]{1,150}$/;
const seg = (value) => {
    if (!SEGMENT.test(value)) {
        throw new AppError_1.BadRequestError('Referensi data tidak valid');
    }
    return value;
};
const childList = (snapshot) => {
    const value = snapshot.val();
    if (!value || typeof value !== 'object')
        return [];
    return Object.entries(value).map(([key, entry]) => ({
        ...entry,
        id: key,
    }));
};
const single = (snapshot) => {
    if (!snapshot.exists())
        return null;
    const value = snapshot.val();
    return { ...value, id: snapshot.key ?? '' };
};
const write = async (path, data) => {
    await (0, firebase_1.getRealtimeDatabase)().ref(path).set(data);
};
class RtdbUserRepository {
    async findById(id) {
        const snapshot = await (0, firebase_1.getRealtimeDatabase)().ref(`users/${seg(id)}`).once('value');
        return single(snapshot);
    }
    async findByEmail(email) {
        const snapshot = await (0, firebase_1.getRealtimeDatabase)()
            .ref('users')
            .orderByChild('email')
            .equalTo(email.trim().toLowerCase())
            .limitToFirst(1)
            .once('value');
        return childList(snapshot)[0] ?? null;
    }
    async create(user) {
        const { id, ...data } = user;
        await write(`users/${seg(id)}`, data);
        return user;
    }
    async update(id, patch) {
        const existing = await this.findById(id);
        if (!existing)
            return null;
        const { id: _ignored, ...data } = patch;
        await (0, firebase_1.getRealtimeDatabase)().ref(`users/${seg(id)}`).update(data);
        return this.findById(id);
    }
}
exports.RtdbUserRepository = RtdbUserRepository;
class RtdbItemRepository {
    async findAllByUser(userId) {
        const snapshot = await (0, firebase_1.getRealtimeDatabase)()
            .ref(`items/${seg(userId)}`)
            .orderByChild('name')
            .once('value');
        return childList(snapshot);
    }
    async findById(userId, id) {
        const snapshot = await (0, firebase_1.getRealtimeDatabase)()
            .ref(`items/${seg(userId)}/${seg(id)}`)
            .once('value');
        const item = single(snapshot);
        if (!item || item.userId !== userId)
            return null;
        return item;
    }
    async create(item) {
        const { id, ...data } = item;
        await write(`items/${seg(item.userId)}/${seg(id)}`, data);
        return item;
    }
    async update(userId, id, patch) {
        const existing = await this.findById(userId, id);
        if (!existing)
            return null;
        const { id: _ignored, userId: _owner, ...data } = patch;
        await write(`items/${seg(userId)}/${seg(id)}`, { ...existing, ...data });
        return this.findById(userId, id);
    }
    async remove(userId, id) {
        const existing = await this.findById(userId, id);
        if (!existing)
            return false;
        await (0, firebase_1.getRealtimeDatabase)().ref(`items/${seg(userId)}/${seg(id)}`).remove();
        return true;
    }
}
exports.RtdbItemRepository = RtdbItemRepository;
class RtdbProductionRepository {
    async findByUser(userId, options) {
        let query = (0, firebase_1.getRealtimeDatabase)()
            .ref(`productions/${seg(userId)}`)
            .orderByChild('createdAt');
        if (options?.since) {
            query = query.startAt(options.since);
        }
        const snapshot = await query.once('value');
        return childList(snapshot).reverse();
    }
    async findById(userId, id) {
        const snapshot = await (0, firebase_1.getRealtimeDatabase)()
            .ref(`productions/${seg(userId)}/${seg(id)}`)
            .once('value');
        const production = single(snapshot);
        if (!production || production.userId !== userId)
            return null;
        return production;
    }
    async create(production) {
        const { id, ...data } = production;
        await write(`productions/${seg(production.userId)}/${seg(id)}`, data);
        return production;
    }
}
exports.RtdbProductionRepository = RtdbProductionRepository;
class RtdbPhotoRepository {
    async findByUser(userId) {
        const snapshot = await (0, firebase_1.getRealtimeDatabase)()
            .ref(`photos/${seg(userId)}`)
            .orderByChild('createdAt')
            .once('value');
        return childList(snapshot).reverse();
    }
    async findById(userId, id) {
        const snapshot = await (0, firebase_1.getRealtimeDatabase)()
            .ref(`photos/${seg(userId)}/${seg(id)}`)
            .once('value');
        const photo = single(snapshot);
        if (!photo || photo.userId !== userId)
            return null;
        return photo;
    }
    async create(photo) {
        const { id, ...data } = photo;
        await write(`photos/${seg(photo.userId)}/${seg(id)}`, data);
        return photo;
    }
    async remove(userId, id) {
        const existing = await this.findById(userId, id);
        if (!existing)
            return false;
        await (0, firebase_1.getRealtimeDatabase)().ref(`photos/${seg(userId)}/${seg(id)}`).remove();
        return true;
    }
}
exports.RtdbPhotoRepository = RtdbPhotoRepository;
class RtdbNoteRepository {
    async findByUser(userId) {
        const snapshot = await (0, firebase_1.getRealtimeDatabase)()
            .ref(`notes/${seg(userId)}`)
            .orderByChild('createdAt')
            .once('value');
        return childList(snapshot).reverse();
    }
    async findById(userId, id) {
        const snapshot = await (0, firebase_1.getRealtimeDatabase)()
            .ref(`notes/${seg(userId)}/${seg(id)}`)
            .once('value');
        const note = single(snapshot);
        if (!note || note.userId !== userId)
            return null;
        return note;
    }
    async create(note) {
        const { id, ...data } = note;
        await write(`notes/${seg(note.userId)}/${seg(id)}`, data);
        return note;
    }
    async update(userId, id, patch) {
        const existing = await this.findById(userId, id);
        if (!existing)
            return null;
        const { id: _ignored, userId: _owner, ...data } = patch;
        await write(`notes/${seg(userId)}/${seg(id)}`, { ...existing, ...data });
        return this.findById(userId, id);
    }
    async remove(userId, id) {
        const existing = await this.findById(userId, id);
        if (!existing)
            return false;
        await (0, firebase_1.getRealtimeDatabase)().ref(`notes/${seg(userId)}/${seg(id)}`).remove();
        return true;
    }
}
exports.RtdbNoteRepository = RtdbNoteRepository;
class RtdbRefreshTokenRepository {
    async create(record) {
        const { id, ...data } = record;
        await write(`refreshTokens/${seg(id)}`, data);
        return record;
    }
    async findById(id) {
        const snapshot = await (0, firebase_1.getRealtimeDatabase)().ref(`refreshTokens/${seg(id)}`).once('value');
        return single(snapshot);
    }
    async revoke(id, replacedBy = null) {
        const existing = await this.findById(id);
        if (!existing)
            return;
        const { id: _ignored, ...data } = existing;
        await write(`refreshTokens/${seg(id)}`, {
            ...data,
            revokedAt: new Date().toISOString(),
            replacedBy,
        });
    }
    async revokeAllForUser(userId) {
        const snapshot = await (0, firebase_1.getRealtimeDatabase)()
            .ref('refreshTokens')
            .orderByChild('userId')
            .equalTo(userId)
            .once('value');
        const updates = {};
        const revokedAt = new Date().toISOString();
        for (const [key, value] of Object.entries(snapshot.val() ?? {})) {
            const record = value;
            if (!record?.revokedAt && SEGMENT.test(key)) {
                updates[`refreshTokens/${key}/revokedAt`] = revokedAt;
                updates[`refreshTokens/${key}/replacedBy`] = null;
            }
        }
        if (Object.keys(updates).length > 0) {
            await (0, firebase_1.getRealtimeDatabase)().ref().update(updates);
        }
    }
}
exports.RtdbRefreshTokenRepository = RtdbRefreshTokenRepository;
//# sourceMappingURL=repositories.js.map