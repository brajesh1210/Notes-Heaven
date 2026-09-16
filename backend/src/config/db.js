import mongoose from 'mongoose';
import { env } from './env.js';
import logger from '../utils/logger.js';

mongoose.set('strictQuery', true);

export const connectDB = async () => {
  if (!env.mongoUri) {
    logger.error('MONGO_URI missing! backend/.env file me apna MongoDB Atlas connection string daalo.');
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
    logger.info('Check karo: Atlas me Network Access -> 0.0.0.0/0 allow hai? DB user ka password sahi hai?');
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  await mongoose.connection.close();
  logger.info('MongoDB connection closed');
};
