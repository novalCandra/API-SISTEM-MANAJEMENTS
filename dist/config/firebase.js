"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.COLLECTIONS = void 0;
exports.getFirebaseApp = getFirebaseApp;
exports.getFirestore = getFirestore;
exports.getStorageBucket = getStorageBucket;
exports.getRealtimeDatabase = getRealtimeDatabase;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const env_1 = require("./env");
const logger_1 = require("./logger");
let cachedApp = null;
function getFirebaseApp() {
    if (cachedApp)
        return cachedApp;
    if (firebase_admin_1.default.apps.length > 0) {
        cachedApp = firebase_admin_1.default.app();
        return cachedApp;
    }
    const bucket = env_1.config.FIREBASE_STORAGE_BUCKET || undefined;
    if (env_1.config.GOOGLE_APPLICATION_CREDENTIALS) {
        cachedApp = firebase_admin_1.default.initializeApp({
            credential: firebase_admin_1.default.credential.applicationDefault(),
            storageBucket: bucket,
        });
        logger_1.logger.info('Firebase Admin initialized with application default credentials');
        return cachedApp;
    }
    if (env_1.config.FIREBASE_PROJECT_ID && env_1.config.FIREBASE_CLIENT_EMAIL && env_1.config.FIREBASE_PRIVATE_KEY) {
        cachedApp = firebase_admin_1.default.initializeApp({
            credential: firebase_admin_1.default.credential.cert({
                projectId: env_1.config.FIREBASE_PROJECT_ID,
                clientEmail: env_1.config.FIREBASE_CLIENT_EMAIL,
                privateKey: env_1.config.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            }),
            storageBucket: bucket,
        });
        logger_1.logger.info('Firebase Admin initialized with inline service account');
        return cachedApp;
    }
    throw new Error('Firebase credentials are missing. Set GOOGLE_APPLICATION_CREDENTIALS or the FIREBASE_* variables.');
}
function getFirestore() {
    return getFirebaseApp().firestore();
}
function getStorageBucket() {
    return getFirebaseApp().storage();
}
let cachedDatabase = null;
/**
 * Realtime Database (firebase-admin/database).
 * Dukungan emulator: set FIREBASE_DATABASE_EMULATOR_HOST=host:port, atau isi
 * FIREBASE_DATABASE_URL ke URL emulator (http://127.0.0.1:9000?ns=<project-id>).
 */
function getRealtimeDatabase() {
    if (cachedDatabase)
        return cachedDatabase;
    const app = getFirebaseApp();
    const emulatorHost = process.env.FIREBASE_DATABASE_EMULATOR_HOST;
    const projectId = env_1.config.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID || '';
    if (emulatorHost && !env_1.config.FIREBASE_DATABASE_URL) {
        const namespace = projectId || 'demo-stokku';
        cachedDatabase = app.database(`http://${emulatorHost}?ns=${namespace}`);
        logger_1.logger.info({ emulatorHost, namespace }, 'Firebase Realtime Database emulator connected');
        return cachedDatabase;
    }
    if (!env_1.config.FIREBASE_DATABASE_URL) {
        throw new Error('FIREBASE_DATABASE_URL is required for the realtime database (set it, or enable the emulator via FIREBASE_DATABASE_EMULATOR_HOST).');
    }
    cachedDatabase = app.database(env_1.config.FIREBASE_DATABASE_URL);
    logger_1.logger.info('Firebase Realtime Database connected');
    return cachedDatabase;
}
exports.COLLECTIONS = {
    users: 'users',
    items: 'items',
    productions: 'productions',
    photos: 'photos',
    notes: 'notes',
    refreshTokens: 'refresh_tokens',
};
//# sourceMappingURL=firebase.js.map