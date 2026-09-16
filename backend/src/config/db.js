import mongoose from 'mongoose';
import { env } from './env.js';
import logger from '../utils/logger.js';

mongoose.set('strictQuery', true);

export const connectDB = async () => {
  if (!env.mongoUri) {
    logger.error('MONGO_URI is missing. Add your MongoDB Atlas connection string to backend/.env.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 15000,
    });
    logger.success(`MongoDB connected -> ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    logger.error(`MongoDB connection failed: ${err.message}`);
    logger.info('Check that Atlas Network Access allows your IP (or 0.0.0.0/0) and that the DB user password is correct.');
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  await mongoose.connection.close();
  logger.info('MongoDB connection closed');
};
