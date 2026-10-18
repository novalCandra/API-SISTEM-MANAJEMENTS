import type admin from 'firebase-admin';
import { COLLECTIONS, getFirestore } from '../../config/firebase';
import type {
  Item,
  Note,
  Photo,
  Production,
  RefreshTokenRecord,
  User,
} from '../../types/domain';
import type {
  IItemRepository,
  INoteRepository,
  IPhotoRepository,
  IProductionRepository,
  IRefreshTokenRepository,
  IUserRepository,
} from '../interfaces';

const strip = <T extends { id: string }>(id: string, data: unknown): T => ({
  ...(data as Record<string, unknown>),
  id,
}) as T;

export class FirestoreUserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    const snap = await getFirestore().collection(COLLECTIONS.users).doc(id).get();
    if (!snap.exists) return null;
    return strip<User>(snap.id, snap.data());
  }

  async findByEmail(email: string): Promise<User | null> {
    const snap = await getFirestore()
      .collection(COLLECTIONS.users)
      .where('email', '==', email.trim().toLowerCase())
      .limit(1)
      .get();
    const doc = snap.docs[0];
    return doc ? strip<User>(doc.id, doc.data()) : null;
  }

  async create(user: User): Promise<User> {
    const { id, ...data } = user;
    await getFirestore().collection(COLLECTIONS.users).doc(id).set(data);
    return user;
  }

  async update(id: string, patch: Partial<User>): Promise<User | null> {
    const ref = getFirestore().collection(COLLECTIONS.users).doc(id);
    const snap = await ref.get();
    if (!snap.exists) return null;
    const { id: _ignored, ...data } = patch;
    await ref.set(data, { merge: true });
    const updated = await ref.get();
    return strip<User>(updated.id, updated.data());
  }
}

export class FirestoreItemRepository implements IItemRepository {
  async findAllByUser(userId: string): Promise<Item[]> {
    const snap = await getFirestore()
      .collection(COLLECTIONS.items)
      .where('userId', '==', userId)
      .orderBy('name')
      .get();
    return snap.docs.map((doc) => strip<Item>(doc.id, doc.data()));
  }

  async findById(userId: string, id: string): Promise<Item | null> {
    const snap = await getFirestore().collection(COLLECTIONS.items).doc(id).get();
    if (!snap.exists) return null;
    const item = strip<Item>(snap.id, snap.data());
    return item.userId === userId ? item : null;
  }

  async create(item: Item): Promise<Item> {
    const { id, ...data } = item;
    await getFirestore().collection(COLLECTIONS.items).doc(id).set(data);
    return item;
  }

  async update(userId: string, id: string, patch: Partial<Item>): Promise<Item | null> {
    const existing = await this.findById(userId, id);
    if (!existing) return null;
    const ref = getFirestore().collection(COLLECTIONS.items).doc(id);
    const { id: _ignored, userId: _ignoredUser, ...data } = patch;
    await ref.set(data, { merge: true });
    const updated = await ref.get();
    return strip<Item>(updated.id, updated.data());
  }

  async remove(userId: string, id: string): Promise<boolean> {
    const existing = await this.findById(userId, id);
    if (!existing) return false;
    await getFirestore().collection(COLLECTIONS.items).doc(id).delete();
    return true;
  }
}

export class FirestoreProductionRepository implements IProductionRepository {
  async findByUser(userId: string, options?: { since?: string }): Promise<Production[]> {
    let query = getFirestore()
      .collection(COLLECTIONS.productions)
      .where('userId', '==', userId) as admin.firestore.Query;
    if (options?.since) {
      query = query.where('createdAt', '>=', options.since);
    }
    const snap = await query.orderBy('createdAt', 'desc').get();
    return snap.docs.map((doc) => strip<Production>(doc.id, doc.data()));
  }

  async findById(userId: string, id: string): Promise<Production | null> {
    const snap = await getFirestore().collection(COLLECTIONS.productions).doc(id).get();
    if (!snap.exists) return null;
    const production = strip<Production>(snap.id, snap.data());
    return production.userId === userId ? production : null;
  }

  async create(production: Production): Promise<Production> {
    const { id, ...data } = production;
    await getFirestore().collection(COLLECTIONS.productions).doc(id).set(data);
    return production;
  }
}

export class FirestorePhotoRepository implements IPhotoRepository {
  async findByUser(userId: string): Promise<Photo[]> {
    const snap = await getFirestore()
      .collection(COLLECTIONS.photos)
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();
    return snap.docs.map((doc) => strip<Photo>(doc.id, doc.data()));
  }

  async findById(userId: string, id: string): Promise<Photo | null> {
    const snap = await getFirestore().collection(COLLECTIONS.photos).doc(id).get();
    if (!snap.exists) return null;
    const photo = strip<Photo>(snap.id, snap.data());
    return photo.userId === userId ? photo : null;
  }

  async create(photo: Photo): Promise<Photo> {
    const { id, ...data } = photo;
    await getFirestore().collection(COLLECTIONS.photos).doc(id).set(data);
    return photo;
  }

  async remove(userId: string, id: string): Promise<boolean> {
    const existing = await this.findById(userId, id);
    if (!existing) return false;
    await getFirestore().collection(COLLECTIONS.photos).doc(id).delete();
    return true;
  }
}

export class FirestoreNoteRepository implements INoteRepository {
  async findByUser(userId: string): Promise<Note[]> {
    const snap = await getFirestore()
      .collection(COLLECTIONS.notes)
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();
    return snap.docs.map((doc) => strip<Note>(doc.id, doc.data()));
  }

  async findById(userId: string, id: string): Promise<Note | null> {
    const snap = await getFirestore().collection(COLLECTIONS.notes).doc(id).get();
    if (!snap.exists) return null;
    const note = strip<Note>(snap.id, snap.data());
    return note.userId === userId ? note : null;
  }

  async create(note: Note): Promise<Note> {
    const { id, ...data } = note;
    await getFirestore().collection(COLLECTIONS.notes).doc(id).set(data);
    return note;
  }

  async update(userId: string, id: string, patch: Partial<Note>): Promise<Note | null> {
    const existing = await this.findById(userId, id);
    if (!existing) return null;
    const ref = getFirestore().collection(COLLECTIONS.notes).doc(id);
    const { id: _ignored, userId: _ignoredUser, ...data } = patch;
    await ref.set(data, { merge: true });
    const updated = await ref.get();
    return strip<Note>(updated.id, updated.data());
  }

  async remove(userId: string, id: string): Promise<boolean> {
    const existing = await this.findById(userId, id);
    if (!existing) return false;
    await getFirestore().collection(COLLECTIONS.notes).doc(id).delete();
    return true;
  }
}

export class FirestoreRefreshTokenRepository implements IRefreshTokenRepository {
  async create(record: RefreshTokenRecord): Promise<RefreshTokenRecord> {
    const { id, ...data } = record;
    await getFirestore().collection(COLLECTIONS.refreshTokens).doc(id).set(data);
    return record;
  }

  async findById(id: string): Promise<RefreshTokenRecord | null> {
    const snap = await getFirestore().collection(COLLECTIONS.refreshTokens).doc(id).get();
    if (!snap.exists) return null;
    return strip<RefreshTokenRecord>(snap.id, snap.data());
  }

  async revoke(id: string, replacedBy: string | null = null): Promise<void> {
    await getFirestore().collection(COLLECTIONS.refreshTokens).doc(id).set(
      { revokedAt: new Date().toISOString(), replacedBy },
      { merge: true },
    );
  }

  async revokeAllForUser(userId: string): Promise<void> {
    const snap = await getFirestore()
      .collection(COLLECTIONS.refreshTokens)
      .where('userId', '==', userId)
      .where('revokedAt', '==', null)
      .get();
    await Promise.all(
      snap.docs.map((doc) =>
        doc.ref.set({ revokedAt: new Date().toISOString() }, { merge: true }),
      ),
    );
  }
}
