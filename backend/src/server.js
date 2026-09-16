import app from './app.js';
import { env } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import { configurePassport } from './config/passport.js';
import { startTrashCleanupJob, stopTrashCleanupJob } from './tasks/trashCleanup.js';
import logger from './utils/logger.js';

const start = async () => {
  await connectDB();
  configurePassport();

  const server = app.listen(env.port, '0.0.0.0', () => {
    logger.success(`Notes Heaven API live -> http://localhost:${env.port}  [${env.nodeEnv}]`);
    logger.info(`Health check: http://localhost:${env.port}/api/health`);
  });

  startTrashCleanupJob(60); // har ghante expired trash purge

  const shutdown = async (signal) => {
    logger.warn(`${signal} received - shutting down server...`);
    stopTrashCleanupJob();
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
  };

  ['SIGINT', 'SIGTERM'].forEach((sig) => process.on(sig, () => shutdown(sig)));

  process.on('unhandledRejection', (err) => {
    logger.error(`Unhandled rejection: ${err?.message || err}`);
  });
  process.on('uncaughtException', (err) => {
    logger.error(`Uncaught exception: ${err.message}`);
    process.exit(1);
  });
};

start();
