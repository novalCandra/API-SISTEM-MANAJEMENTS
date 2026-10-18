import http from 'node:http';
import { createApp } from './app';
import { getFirebaseApp } from './config/firebase';
import { config } from './config/env';
import { logger } from './config/logger';
import { buildContainer } from './container';
import { RtdbCleanupJob } from './realtime/rtdbEventStore';
import { createSocketServer } from './realtime/socket';
import { assertRtdbNotPublic } from './security/rtdbGuard';

const usesFirebase = config.DB_DRIVER !== 'memory' || config.REALTIME_DRIVER === 'rtdb';

function assertFirebaseReady(): void {
  if (!usesFirebase) return;
  try {
    getFirebaseApp();
    logger.info({ db: config.DB_DRIVER, realtime: config.REALTIME_DRIVER }, 'Firebase Admin ready');
  } catch (error) {
    logger.fatal({ err: error }, 'firebase initialization failed, refusing to start');
    process.exit(1);
  }
}

async function bootstrap(): Promise<void> {
  assertFirebaseReady();

  // Fail closed: cek rules RTDB SEBELUM listen. Bila terbuka (test mode),
  // production menolak start; development memperingati dengan keras.
  if (config.DB_DRIVER === 'rtdb' || config.REALTIME_DRIVER === 'rtdb') {
    await assertRtdbNotPublic(logger);
  }

  const container = buildContainer();
  const app = createApp(container);
  const server = http.createServer(app);

  createSocketServer(server, container.tokens, container.realtime, container.socketBridge);

  const cleanupJob =
    container.realtimeDriver === 'rtdb'
      ? new RtdbCleanupJob(
          container.realtimeEvents,
          logger,
          config.RTDB_EVENT_TTL_MS,
          config.RTDB_CLEANUP_INTERVAL_MS,
        )
      : null;
  cleanupJob?.start();

  server.listen(config.PORT, () => {
    logger.info(
      {
        port: config.PORT,
        env: config.NODE_ENV,
        db: config.DB_DRIVER,
        storage: config.STORAGE_DRIVER,
        realtime: config.REALTIME_DRIVER,
      },
      'StokKu API listening',
    );
  });

  const shutdown = (signal: string) => {
    logger.info({ signal }, 'shutting down');
    cleanupJob?.stop();
    container.socketBridge.dispose();
    server.close(() => {
      logger.info('http server closed');
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'unhandled rejection');
});

process.on('uncaughtException', (error) => {
  logger.fatal({ error }, 'uncaught exception');
  process.exit(1);
});

bootstrap().catch((error: unknown) => {
  logger.fatal({ err: error }, 'bootstrap failed, refusing to start');
  process.exit(1);
});
