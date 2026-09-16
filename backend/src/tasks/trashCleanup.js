import '../config/env.js';
import mongoose from 'mongoose';
import Note from '../models/Note.js';
import logger from '../utils/logger.js';

/**
 * Trash cleanup.
 *
 * The Note schema has a MongoDB TTL index on `scheduledFor`, so the DB
 * deletes expired notes by itself. This job exists to give the frontend accurate
 * `daysLeft` values and as double-safety (the TTL thread runs every 60s).
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
  logger.info(`Trash cleanup job started (every ${everyMinutes} min, retention = 5 days by default)`);
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
