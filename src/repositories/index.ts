import { config } from '../config/env';
import type { Repositories } from './interfaces';
import {
  MemoryItemRepository,
  MemoryNoteRepository,
  MemoryPhotoRepository,
  MemoryProductionRepository,
  MemoryRefreshTokenRepository,
  MemoryStore,
  MemoryUserRepository,
} from './memory/repositories';
import {
  FirestoreItemRepository,
  FirestoreNoteRepository,
  FirestorePhotoRepository,
  FirestoreProductionRepository,
  FirestoreRefreshTokenRepository,
  FirestoreUserRepository,
} from './firestore/repositories';
import {
  RtdbItemRepository,
  RtdbNoteRepository,
  RtdbPhotoRepository,
  RtdbProductionRepository,
  RtdbRefreshTokenRepository,
  RtdbUserRepository,
} from './rtdb/repositories';

export interface RepositoryContainer extends Repositories {
  store?: MemoryStore;
}

export function createRepositories(): RepositoryContainer {
  if (config.DB_DRIVER === 'firestore') {
    return {
      users: new FirestoreUserRepository(),
      items: new FirestoreItemRepository(),
      productions: new FirestoreProductionRepository(),
      photos: new FirestorePhotoRepository(),
      notes: new FirestoreNoteRepository(),
      refreshTokens: new FirestoreRefreshTokenRepository(),
    };
  }

  if (config.DB_DRIVER === 'rtdb') {
    return {
      users: new RtdbUserRepository(),
      items: new RtdbItemRepository(),
      productions: new RtdbProductionRepository(),
      photos: new RtdbPhotoRepository(),
      notes: new RtdbNoteRepository(),
      refreshTokens: new RtdbRefreshTokenRepository(),
    };
  }

  const store = new MemoryStore();
  return {
    users: new MemoryUserRepository(store),
    items: new MemoryItemRepository(store),
    productions: new MemoryProductionRepository(store),
    photos: new MemoryPhotoRepository(store),
    notes: new MemoryNoteRepository(store),
    refreshTokens: new MemoryRefreshTokenRepository(store),
    store,
  };
}
