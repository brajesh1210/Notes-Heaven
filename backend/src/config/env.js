import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// backend/.env  (also works when running from repo root)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const bool = (v, fallback = false) =>
  v === undefined ? fallback : ['1', 'true', 'yes', 'on'].includes(String(v).toLowerCase());

const list = (v = '') =>
  String(v)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 5000),

  mongoUri: process.env.MONGO_URI || '',

  jwtSecret: process.env.JWT_SECRET || 'dev_only_secret_change_me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  corsOrigins: list(process.env.CORS_ORIGINS || process.env.CLIENT_URL || 'http://localhost:5173'),

  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackUrl: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
    folder: process.env.CLOUDINARY_FOLDER || 'notes-heaven',
  },

  mail: {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT || 587),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.MAIL_FROM || 'Notes Heaven <no-reply@notesheaven.app>',
  },

  trashRetentionDays: Number(process.env.TRASH_RETENTION_DAYS || 5),
};

// Which optional integrations are configured (features degrade gracefully when missing)
export const features = {
  get googleOAuth() {
    return Boolean(env.google.clientId && env.google.clientSecret);
  },
  get cloudinary() {
    return Boolean(env.cloudinary.cloudName && env.cloudinary.apiKey && env.cloudinary.apiSecret);
  },
  get mail() {
    return Boolean(env.mail.host && env.mail.user && env.mail.pass);
  },
  get isProd() {
    return env.nodeEnv === 'production';
  },
};
