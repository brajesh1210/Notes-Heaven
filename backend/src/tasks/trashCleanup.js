import '../config/env.js';
import mongoose from 'mongoose';
import Note from '../models/Note.js';
import logger from '../utils/logger.js';

/**
 * Trash cleanup.
 *
 * Note schema me `scheduledFor` par MongoDB TTL index laga hai, matlab DB
 * khud notes delete kar deta hai. Ye job frontend ko accurate `daysLeft` dene aur
 * double-safety ke liye hai (TTL thread 60 sec me chalta hai).
 */
export const purgeExpiredNotes = async () => {
  try {
    const result = await Note.deleteMany({ scheduledFor: { $ne: null, $lte: new Date() } });
    if (result.deletedCount) logger.info(`Trash cleanup: ${result.deletedCount} note(s) permanently deleted`);
    return result.deletedCount;
  } catch (err) {
    logger.error(`Trash cleanup failed: ${err.message}`);
    return 0;
  }
};

let timer = null;

export const startTrashCleanupJob = (everyMinutes = 60) => {
  purgeExpiredNotes();
  timer = setInterval(purgeExpiredNotes, everyMinutes * 60 * 1000);
  timer.unref?.();
  logger.info(`Trash cleanup job started (har ${everyMinutes} min, retention = 5 din by default)`);
  return timer;
};

export const stopTrashCleanupJob = () => {
  if (timer) clearInterval(timer);
  timer = null;
};

export const retentionDaysLeft = (scheduledFor) => {
  if (!scheduledFor) return null;
  const diff = new Date(scheduledFor).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)));
};

export const closeConnections = async () => {
  await mongoose.connection.close();
};
