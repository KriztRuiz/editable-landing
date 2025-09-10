// backend/src/index.ts
import 'dotenv/config';
import express from 'express';
import type { CorsOptions } from 'cors';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';

import { authRouter } from './routes/auth.js';
import { contentRouter } from './routes/content.js';
import helpRouter from './routes/help.js';

const app = express();

/**
 * Render está detrás de 1 proxy (ingress).
 * Esto permite que Express y el rate-limit detecten bien la IP real.
 */
app.set('trust proxy', 1);

/* ===================== CORS (antes de helmet) ===================== */
/** Cadenas separadas por coma y con comodines.
 *  Ejemplo:
 *  CORS_ORIGIN="https://editable-landing.vercel.app,https://editable-landing-*.vercel.app,https://editable-landing-*-*.vercel.app,http://localhost:4321,http://localhost:5173"
 */
const RAW_ALLOWED = process.env.CORS_ORIGIN ?? 'https://editable-landing.vercel.app';
const ALLOWED = RAW_ALLOWED.split(',').map(s => s.trim()).filter(Boolean);

/** Activar logs con CORS_DEBUG=true en Render */
const DEBUG = (process.env.CORS_DEBUG ?? 'false').toLowerCase() === 'true';
function dbg(...args: any[]) {
  if (DEBUG) console.log('[CORS]', ...args);
}
dbg('CORS_ORIGIN raw:', RAW_ALLOWED);
dbg('ALLOWED parsed:', ALLOWED);

/** Coincidencia con comodines: *.vercel.app, etc. */
function matches(origin: string, pattern: string): boolean {
  if (pattern === '*') return true;
  const re = new RegExp(
    '^' +
      pattern
        .replace(/[.+?^${}()|[\]\\]/g, '\\$&') // escapa regex
        .replace(/\*/g, '.*') +               // comodín *
    '$'
  );
  return re.test(origin);
}

const corsOptions: CorsOptions = {
  origin(origin, cb) {
    // Permite peticiones sin Origin (health checks, SSR, curl)
    if (!origin) {
      dbg('Sin Origin → allow');
      return cb(null, true);
    }
    const rule = ALLOWED.find(p => matches(origin, p));
    dbg('Origin:', origin, '→', rule ? `ALLOW (${rule})` : 'BLOCK');
    return rule ? cb(null, true) : cb(new Error(`CORS: origin not allowed: ${origin}`));
  },
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
  maxAge: 86400, // cache del preflight (24h)
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
/* =================== fin CORS =================== */

/**
 * Helmet DESPUÉS de CORS para no interferir con cabeceras cross-origin.
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
  windowMs: 60_000,
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
