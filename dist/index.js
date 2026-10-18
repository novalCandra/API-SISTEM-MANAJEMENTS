"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_http_1 = __importDefault(require("node:http"));
const app_1 = require("./app");
const firebase_1 = require("./config/firebase");
const env_1 = require("./config/env");
const logger_1 = require("./config/logger");
const container_1 = require("./container");
const rtdbEventStore_1 = require("./realtime/rtdbEventStore");
const socket_1 = require("./realtime/socket");
const rtdbGuard_1 = require("./security/rtdbGuard");
const usesFirebase = env_1.config.DB_DRIVER !== 'memory' || env_1.config.REALTIME_DRIVER === 'rtdb';
function assertFirebaseReady() {
    if (!usesFirebase)
        return;
    try {
        (0, firebase_1.getFirebaseApp)();
        logger_1.logger.info({ db: env_1.config.DB_DRIVER, realtime: env_1.config.REALTIME_DRIVER }, 'Firebase Admin ready');
    }
    catch (error) {
        logger_1.logger.fatal({ err: error }, 'firebase initialization failed, refusing to start');
        process.exit(1);
    }
}
async function bootstrap() {
    assertFirebaseReady();
    // Fail closed: cek rules RTDB SEBELUM listen. Bila terbuka (test mode),
    // production menolak start; development memperingati dengan keras.
    if (env_1.config.DB_DRIVER === 'rtdb' || env_1.config.REALTIME_DRIVER === 'rtdb') {
        await (0, rtdbGuard_1.assertRtdbNotPublic)(logger_1.logger);
    }
    const container = (0, container_1.buildContainer)();
    const app = (0, app_1.createApp)(container);
    const server = node_http_1.default.createServer(app);
    (0, socket_1.createSocketServer)(server, container.tokens, container.realtime, container.socketBridge);
    const cleanupJob = container.realtimeDriver === 'rtdb'
        ? new rtdbEventStore_1.RtdbCleanupJob(container.realtimeEvents, logger_1.logger, env_1.config.RTDB_EVENT_TTL_MS, env_1.config.RTDB_CLEANUP_INTERVAL_MS)
        : null;
    cleanupJob?.start();
    server.listen(env_1.config.PORT, () => {
        logger_1.logger.info({
            port: env_1.config.PORT,
            env: env_1.config.NODE_ENV,
            db: env_1.config.DB_DRIVER,
            storage: env_1.config.STORAGE_DRIVER,
            realtime: env_1.config.REALTIME_DRIVER,
        }, 'StokKu API listening');
    });
    const shutdown = (signal) => {
        logger_1.logger.info({ signal }, 'shutting down');
        cleanupJob?.stop();
        container.socketBridge.dispose();
        server.close(() => {
            logger_1.logger.info('http server closed');
            process.exit(0);
        });
        setTimeout(() => process.exit(1), 10_000).unref();
    };
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
}
process.on('unhandledRejection', (reason) => {
    logger_1.logger.error({ reason }, 'unhandled rejection');
});
process.on('uncaughtException', (error) => {
    logger_1.logger.fatal({ error }, 'uncaught exception');
    process.exit(1);
});
bootstrap().catch((error) => {
    logger_1.logger.fatal({ err: error }, 'bootstrap failed, refusing to start');
    process.exit(1);
});
//# sourceMappingURL=index.js.map