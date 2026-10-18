import admin from 'firebase-admin';
import type { Database } from 'firebase-admin/database';
import { config } from './env';
import { logger } from './logger';

let cachedApp: admin.app.App | null = null;

export function getFirebaseApp(): admin.app.App {
  if (cachedApp) return cachedApp;
  if (admin.apps.length > 0) {
    cachedApp = admin.app();
    return cachedApp;
  }

  const bucket = config.FIREBASE_STORAGE_BUCKET || undefined;

  if (config.GOOGLE_APPLICATION_CREDENTIALS) {
    cachedApp = admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      storageBucket: bucket,
    });
    logger.info('Firebase Admin initialized with application default credentials');
    return cachedApp;
  }

  if (config.FIREBASE_PROJECT_ID && config.FIREBASE_CLIENT_EMAIL && config.FIREBASE_PRIVATE_KEY) {
    cachedApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: config.FIREBASE_PROJECT_ID,
        clientEmail: config.FIREBASE_CLIENT_EMAIL,
        privateKey: config.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
      storageBucket: bucket,
    });
    logger.info('Firebase Admin initialized with inline service account');
    return cachedApp;
  }

  throw new Error(
    'Firebase credentials are missing. Set GOOGLE_APPLICATION_CREDENTIALS or the FIREBASE_* variables.',
  );
}

export function getFirestore(): admin.firestore.Firestore {
  return getFirebaseApp().firestore();
}

export function getStorageBucket(): admin.storage.Storage {
  return getFirebaseApp().storage();
}

let cachedDatabase: Database | null = null;

/**
 * Realtime Database (firebase-admin/database).
 * Dukungan emulator: set FIREBASE_DATABASE_EMULATOR_HOST=host:port, atau isi
 * FIREBASE_DATABASE_URL ke URL emulator (http://127.0.0.1:9000?ns=<project-id>).
 */
export function getRealtimeDatabase(): Database {
  if (cachedDatabase) return cachedDatabase;

  const app = getFirebaseApp();
  const emulatorHost = process.env.FIREBASE_DATABASE_EMULATOR_HOST;
  const projectId =
    config.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID || '';

  if (emulatorHost && !config.FIREBASE_DATABASE_URL) {
    const namespace = projectId || 'demo-stokku';
    cachedDatabase = app.database(`http://${emulatorHost}?ns=${namespace}`);
    logger.info({ emulatorHost, namespace }, 'Firebase Realtime Database emulator connected');
    return cachedDatabase;
  }

  if (!config.FIREBASE_DATABASE_URL) {
    throw new Error(
      'FIREBASE_DATABASE_URL is required for the realtime database (set it, or enable the emulator via FIREBASE_DATABASE_EMULATOR_HOST).',
    );
  }

  cachedDatabase = app.database(config.FIREBASE_DATABASE_URL);
  logger.info('Firebase Realtime Database connected');
  return cachedDatabase;
}

export const COLLECTIONS = {
  users: 'users',
  items: 'items',
  productions: 'productions',
  photos: 'photos',
  notes: 'notes',
  refreshTokens: 'refresh_tokens',
} as const;
