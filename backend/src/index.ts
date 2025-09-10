// backend/src/index.ts
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';

import { authRouter } from './routes/auth.js';
import { contentRouter } from './routes/content.js';
import helpRouter from './routes/help.js';

const app = express();

/**
 * Render está detrás de 1 proxy (ingress), así que esto ayuda
 * a que Express detecte bien la IP del cliente y a que el rate-limit funcione.
 */
app.set('trust proxy', 1);

/**
 * CORS (colócalo ANTES de helmet)
 * Lee CORS_ORIGIN (separado por comas) desde las variables de entorno.
 * Ejemplo: CORS_ORIGIN="https://editable-landing.vercel.app,https://tus-previas.vercel.app"
 */
const ALLOWED_ORIGINS = (process.env.CORS_ORIGIN ??
  'https://editable-landing.vercel.app')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, cb) {
      // Permite peticiones sin origen (health checks, SSR, curl)
      if (!origin) return cb(null, true);
      if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
      return cb(new Error(`CORS: origin not allowed: ${origin}`));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false,
    maxAge: 86400, // cache del preflight
  })
);

// Responde preflights
app.options('*', cors());

/**
 * Helmet DESPUÉS de cors para no interferir con cabeceras cross-origin.
 * crossOriginResourcePolicy en 'cross-origin' evita bloquear recursos externos válidos.
 */
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Body parser
app.use(express.json({ limit: '1mb' }));

// Rate limit (usar trustProxy:true porque estamos detrás de proxy)
const limiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 50,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  validate: { trustProxy: true },
});
app.use(limiter);

// Healthchecks
app.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }));
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Rutas
app.use('/api/auth', authRouter);
app.use('/api/content', contentRouter);
app.use('/api/help', helpRouter);

// Conexión a Mongo y arranque
const MONGO_URL = process.env.MONGO_URL ?? '';
const PORT = Number(process.env.PORT ?? 4000);

async function start() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log('Connected to MongoDB');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`API running on port ${PORT}`);
    });
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
}

void start();
