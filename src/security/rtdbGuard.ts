import { config } from '../config/env';
import type { Logger } from '../config/logger';

/**
 * Guard keamanan: pastikan aturan Realtime Database BUKAN test mode
 * (terbuka untuk publik).
 *
 * Server melakukan GET tanpa autentikasi ke root database. Bila berhasil
 * (HTTP 200), berarti siapa pun di internet bisa membaca/menulis data
 * (email, hash password, stok, dsb). Pada production server MENOLAK start
 * (fail closed, A10); pada development hanya memberi peringatan keras.
 */
export async function assertRtdbNotPublic(logger: Logger): Promise<void> {
  const rawUrl = config.FIREBASE_DATABASE_URL;
  if (!rawUrl) return;
  if (process.env.FIREBASE_DATABASE_EMULATOR_HOST) return;

  const url = rawUrl.replace(/\/+$/, '') + '/.json';
  const message =
    'REALTIME DATABASE MASIH TERBUKA (rules test mode). ' +
    'Siapa pun bisa membaca/menulis data tanpa login. ' +
    'Segera publish rules deny-by-default dari firebase/database.rules.json di Firebase Console.';

  let res: Response;
  try {
    res = await fetch(url, { method: 'GET', signal: AbortSignal.timeout(10_000) });
  } catch (error) {
    logger.warn({ err: error }, 'could not verify realtime database rules (skipped)');
    return;
  }

  if (res.ok) {
    if (config.isProduction) {
      logger.fatal({ database: rawUrl }, message);
      throw new Error(message);
    }
    logger.fatal({ database: rawUrl }, message + ' (development: server tetap jalan, tapi PERBAIKI SEKARANG)');
    return;
  }

  logger.info({ status: res.status }, 'realtime database rules verified: akses tanpa login ditolak');
}
