import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import routes from './routes/index.js';
import { env, features } from './config/env.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';
import logger from './utils/logger.js';

const app = express();

app.set('trust proxy', 1); // Render/Vercel ke peeche secure cookies ke liye

// ---- Security ----
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Cloudinary images frontend me load ho sakein
    contentSecurityPolicy: false,
  })
);

// ---- CORS (credentials ke saath) ----
const allowed = new Set([...env.corsOrigins, env.clientUrl].filter(Boolean));

app.use(
  cors({
    origin(origin, cb) {
      // Postman / same-origin / server-to-server (origin undefined) allow
      if (!origin || allowed.has(origin) || origin.endsWith('.vercel.app')) return cb(null, true);
      logger.warn(`CORS blocked: ${origin}`);
      return cb(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })
);

// ---- Parsers ----
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ---- Logging ----
app.use(morgan(features.isProd ? 'combined' : 'dev'));

// ---- Health check (Render ke liye) ----
app.get('/', (_req, res) =>
  res.json({
    success: true,
    name: 'Notes Heaven API',
    version: '1.0.0',
    status: 'running',
    docs: '/api/health',
  })
);

app.get('/api/health', (_req, res) =>
  res.json({
    success: true,
    message: 'Notes Heaven API is healthy ✅',
    uptime: `${Math.floor(process.uptime())}s`,
    env: env.nodeEnv,
    features: {
      googleOAuth: features.googleOAuth,
      cloudinary: features.cloudinary,
      mail: features.mail,
    },
    time: new Date().toISOString(),
  })
);

// ---- API routes ----
app.use('/api', routes);

// ---- 404 + error handler (hamesha last) ----
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
