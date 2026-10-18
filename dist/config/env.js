"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const isProduction = process.env.NODE_ENV === 'production';
const SECRET_MIN = 32;
const schema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'test', 'production']).default('development'),
    PORT: zod_1.z.coerce.number().int().positive().default(3000),
    CLIENT_ORIGIN: zod_1.z.string().default('http://localhost:5173'),
    PUBLIC_BASE_URL: zod_1.z.string().default('http://localhost:3000'),
    JWT_ACCESS_SECRET: zod_1.z.string().min(1).default('dev-access-secret-insecure-change-me-0000'),
    JWT_REFRESH_SECRET: zod_1.z.string().min(1).default('dev-refresh-secret-insecure-change-me-000'),
    JWT_ACCESS_TTL: zod_1.z.string().default('15m'),
    JWT_REFRESH_TTL: zod_1.z.string().default('7d'),
    COOKIE_NAME: zod_1.z.string().default('stokku_rt'),
    COOKIE_DOMAIN: zod_1.z.string().optional().default(''),
    COOKIE_SECURE: zod_1.z
        .string()
        .default('false')
        .transform((v) => v === 'true'),
    COOKIE_SAMESITE: zod_1.z.enum(['lax', 'strict', 'none']).default('strict'),
    DB_DRIVER: zod_1.z.enum(['memory', 'firestore', 'rtdb']).default('memory'),
    STORAGE_DRIVER: zod_1.z.enum(['local', 'firebase']).default('local'),
    UPLOAD_DIR: zod_1.z.string().default('./uploads'),
    // socket: emit langsung via Socket.IO. rtdb: tulis event ke Firebase
    // Realtime Database lalu bridge meneruskannya ke Socket.IO.
    REALTIME_DRIVER: zod_1.z.enum(['socket', 'rtdb']).default('socket'),
    FIREBASE_DATABASE_URL: zod_1.z.string().optional().default(''),
    RTDB_EVENT_TTL_MS: zod_1.z.coerce.number().int().positive().default(15 * 60 * 1000),
    RTDB_CLEANUP_INTERVAL_MS: zod_1.z.coerce.number().int().positive().default(5 * 60 * 1000),
    RATE_LIMIT_WINDOW_MS: zod_1.z.coerce.number().int().positive().default(15 * 60 * 1000),
    RATE_LIMIT_MAX: zod_1.z.coerce.number().int().positive().default(300),
    LOGIN_RATE_LIMIT_MAX: zod_1.z.coerce.number().int().positive().default(5),
    LOGIN_RATE_LIMIT_WINDOW_MS: zod_1.z.coerce.number().int().positive().default(15 * 60 * 1000),
    UPLOAD_RATE_LIMIT_MAX: zod_1.z.coerce.number().int().positive().default(30),
    GOOGLE_APPLICATION_CREDENTIALS: zod_1.z.string().optional().default(''),
    FIREBASE_PROJECT_ID: zod_1.z.string().optional().default(''),
    FIREBASE_CLIENT_EMAIL: zod_1.z.string().optional().default(''),
    FIREBASE_PRIVATE_KEY: zod_1.z.string().optional().default(''),
    FIREBASE_STORAGE_BUCKET: zod_1.z.string().optional().default(''),
    LOG_LEVEL: zod_1.z.string().default('info'),
});
const parsed = schema.safeParse(process.env);
if (!parsed.success) {
    const issues = parsed.error.issues
        .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
        .join('\n');
    throw new Error(`Invalid environment configuration:\n${issues}`);
}
const raw = parsed.data;
const warnings = [];
if (isProduction) {
    if (raw.JWT_ACCESS_SECRET.length < SECRET_MIN) {
        warnings.push(`JWT_ACCESS_SECRET must be >= ${SECRET_MIN} bytes in production.`);
    }
    if (raw.JWT_REFRESH_SECRET.length < SECRET_MIN) {
        warnings.push(`JWT_REFRESH_SECRET must be >= ${SECRET_MIN} bytes in production.`);
    }
    if (!raw.COOKIE_SECURE) {
        warnings.push('COOKIE_SECURE should be "true" in production (serve over HTTPS only).');
    }
    if (raw.DB_DRIVER === 'memory') {
        warnings.push('DB_DRIVER=memory in production: data will not persist. Use firestore.');
    }
    if (raw.STORAGE_DRIVER === 'local') {
        warnings.push('STORAGE_DRIVER=local in production: use firebase for durable uploads.');
    }
    const usesRealtimeDatabase = raw.DB_DRIVER === 'rtdb' || raw.REALTIME_DRIVER === 'rtdb';
    if (usesRealtimeDatabase && !raw.FIREBASE_DATABASE_URL) {
        warnings.push('FIREBASE_DATABASE_URL is required when DB_DRIVER/REALTIME_DRIVER=rtdb.');
    }
    if (usesRealtimeDatabase &&
        !raw.GOOGLE_APPLICATION_CREDENTIALS &&
        !(raw.FIREBASE_PROJECT_ID && raw.FIREBASE_CLIENT_EMAIL && raw.FIREBASE_PRIVATE_KEY)) {
        warnings.push('Firebase credentials are required when using the realtime database.');
    }
    if (warnings.length > 0) {
        throw new Error(`Insecure production configuration:\n${warnings.map((w) => `  - ${w}`).join('\n')}`);
    }
}
exports.config = {
    ...raw,
    isProduction,
    isTest: raw.NODE_ENV === 'test',
    clientOrigins: raw.CLIENT_ORIGIN.split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
};
//# sourceMappingURL=env.js.map