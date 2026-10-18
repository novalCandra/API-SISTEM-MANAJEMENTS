"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirestoreRefreshTokenRepository = exports.FirestoreNoteRepository = exports.FirestorePhotoRepository = exports.FirestoreProductionRepository = exports.FirestoreItemRepository = exports.FirestoreUserRepository = void 0;
const firebase_1 = require("../../config/firebase");
const strip = (id, data) => ({
    ...data,
    id,
});
class FirestoreUserRepository {
    async findById(id) {
        const snap = await (0, firebase_1.getFirestore)().collection(firebase_1.COLLECTIONS.users).doc(id).get();
        if (!snap.exists)
            return null;
        return strip(snap.id, snap.data());
    }
    async findByEmail(email) {
        const snap = await (0, firebase_1.getFirestore)()
            .collection(firebase_1.COLLECTIONS.users)
            .where('email', '==', email.trim().toLowerCase())
            .limit(1)
            .get();
        const doc = snap.docs[0];
        return doc ? strip(doc.id, doc.data()) : null;
    }
    async create(user) {
        const { id, ...data } = user;
        await (0, firebase_1.getFirestore)().collection(firebase_1.COLLECTIONS.users).doc(id).set(data);
        return user;
    }
    async update(id, patch) {
        const ref = (0, firebase_1.getFirestore)().collection(firebase_1.COLLECTIONS.users).doc(id);
        const snap = await ref.get();
        if (!snap.exists)
            return null;
        const { id: _ignored, ...data } = patch;
        await ref.set(data, { merge: true });
        const updated = await ref.get();
        return strip(updated.id, updated.data());
    }
}
exports.FirestoreUserRepository = FirestoreUserRepository;
class FirestoreItemRepository {
    async findAllByUser(userId) {
        const snap = await (0, firebase_1.getFirestore)()
            .collection(firebase_1.COLLECTIONS.items)
            .where('userId', '==', userId)
            .orderBy('name')
            .get();
        return snap.docs.map((doc) => strip(doc.id, doc.data()));
    }
    async findById(userId, id) {
        const snap = await (0, firebase_1.getFirestore)().collection(firebase_1.COLLECTIONS.items).doc(id).get();
        if (!snap.exists)
            return null;
        const item = strip(snap.id, snap.data());
        return item.userId === userId ? item : null;
    }
    async create(item) {
        const { id, ...data } = item;
        await (0, firebase_1.getFirestore)().collection(firebase_1.COLLECTIONS.items).doc(id).set(data);
        return item;
    }
    async update(userId, id, patch) {
        const existing = await this.findById(userId, id);
        if (!existing)
            return null;
        const ref = (0, firebase_1.getFirestore)().collection(firebase_1.COLLECTIONS.items).doc(id);
        const { id: _ignored, userId: _ignoredUser, ...data } = patch;
        await ref.set(data, { merge: true });
        const updated = await ref.get();
        return strip(updated.id, updated.data());
    }
    async remove(userId, id) {
        const existing = await this.findById(userId, id);
        if (!existing)
            return false;
        await (0, firebase_1.getFirestore)().collection(firebase_1.COLLECTIONS.items).doc(id).delete();
        return true;
    }
}
exports.FirestoreItemRepository = FirestoreItemRepository;
class FirestoreProductionRepository {
    async findByUser(userId, options) {
        let query = (0, firebase_1.getFirestore)()
            .collection(firebase_1.COLLECTIONS.productions)
            .where('userId', '==', userId);
        if (options?.since) {
            query = query.where('createdAt', '>=', options.since);
        }
        const snap = await query.orderBy('createdAt', 'desc').get();
        return snap.docs.map((doc) => strip(doc.id, doc.data()));
    }
    async findById(userId, id) {
        const snap = await (0, firebase_1.getFirestore)().collection(firebase_1.COLLECTIONS.productions).doc(id).get();
        if (!snap.exists)
            return null;
        const production = strip(snap.id, snap.data());
        return production.userId === userId ? production : null;
    }
    async create(production) {
        const { id, ...data } = production;
        await (0, firebase_1.getFirestore)().collection(firebase_1.COLLECTIONS.productions).doc(id).set(data);
        return production;
    }
}
exports.FirestoreProductionRepository = FirestoreProductionRepository;
class FirestorePhotoRepository {
    async findByUser(userId) {
        const snap = await (0, firebase_1.getFirestore)()
            .collection(firebase_1.COLLECTIONS.photos)
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .get();
        return snap.docs.map((doc) => strip(doc.id, doc.data()));
    }
    async findById(userId, id) {
        const snap = await (0, firebase_1.getFirestore)().collection(firebase_1.COLLECTIONS.photos).doc(id).get();
        if (!snap.exists)
            return null;
        const photo = strip(snap.id, snap.data());
        return photo.userId === userId ? photo : null;
    }
    async create(photo) {
        const { id, ...data } = photo;
        await (0, firebase_1.getFirestore)().collection(firebase_1.COLLECTIONS.photos).doc(id).set(data);
        return photo;
    }
    async remove(userId, id) {
        const existing = await this.findById(userId, id);
        if (!existing)
            return false;
        await (0, firebase_1.getFirestore)().collection(firebase_1.COLLECTIONS.photos).doc(id).delete();
        return true;
    }
}
exports.FirestorePhotoRepository = FirestorePhotoRepository;
class FirestoreNoteRepository {
    async findByUser(userId) {
        const snap = await (0, firebase_1.getFirestore)()
            .collection(firebase_1.COLLECTIONS.notes)
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .get();
        return snap.docs.map((doc) => strip(doc.id, doc.data()));
    }
    async findById(userId, id) {
        const snap = await (0, firebase_1.getFirestore)().collection(firebase_1.COLLECTIONS.notes).doc(id).get();
        if (!snap.exists)
            return null;
        const note = strip(snap.id, snap.data());
        return note.userId === userId ? note : null;
    }
    async create(note) {
        const { id, ...data } = note;
        await (0, firebase_1.getFirestore)().collection(firebase_1.COLLECTIONS.notes).doc(id).set(data);
        return note;
    }
    async update(userId, id, patch) {
        const existing = await this.findById(userId, id);
        if (!existing)
            return null;
        const ref = (0, firebase_1.getFirestore)().collection(firebase_1.COLLECTIONS.notes).doc(id);
        const { id: _ignored, userId: _ignoredUser, ...data } = patch;
        await ref.set(data, { merge: true });
        const updated = await ref.get();
        return strip(updated.id, updated.data());
    }
    async remove(userId, id) {
        const existing = await this.findById(userId, id);
        if (!existing)
            return false;
        await (0, firebase_1.getFirestore)().collection(firebase_1.COLLECTIONS.notes).doc(id).delete();
        return true;
    }
}
exports.FirestoreNoteRepository = FirestoreNoteRepository;
class FirestoreRefreshTokenRepository {
    async create(record) {
        const { id, ...data } = record;
        await (0, firebase_1.getFirestore)().collection(firebase_1.COLLECTIONS.refreshTokens).doc(id).set(data);
        return record;
    }
    async findById(id) {
        const snap = await (0, firebase_1.getFirestore)().collection(firebase_1.COLLECTIONS.refreshTokens).doc(id).get();
        if (!snap.exists)
            return null;
        return strip(snap.id, snap.data());
    }
    async revoke(id, replacedBy = null) {
        await (0, firebase_1.getFirestore)().collection(firebase_1.COLLECTIONS.refreshTokens).doc(id).set({ revokedAt: new Date().toISOString(), replacedBy }, { merge: true });
    }
    async revokeAllForUser(userId) {
        const snap = await (0, firebase_1.getFirestore)()
            .collection(firebase_1.COLLECTIONS.refreshTokens)
            .where('userId', '==', userId)
            .where('revokedAt', '==', null)
            .get();
        await Promise.all(snap.docs.map((doc) => doc.ref.set({ revokedAt: new Date().toISOString() }, { merge: true })));
    }
}
exports.FirestoreRefreshTokenRepository = FirestoreRefreshTokenRepository;
//# sourceMappingURL=repositories.js.map