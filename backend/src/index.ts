// backend/src/index.ts

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import {authRouter} from './routes/auth';
import {contentRouter} from './routes/content';

dotenv.config();

const app = express();

// Indica cuántos proxies hay entre el cliente y tu servidor (Render usa 1)
const NUMBER_OF_PROXIES = 1;
app.set('trust proxy', NUMBER_OF_PROXIES);

app.use(helmet());
app.use(cors({ origin: '*' }));
app.use(express.json());

app.options('*', cors());

// Configuración del limitador
const limiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 50,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  validate: { trustProxy: false }
});
app.use(limiter);

// Endpoint de salud
app.get('/health', (_, res) => {
  res.status(200).json({ status: 'ok' });
});

// Rutas
app.use('/api/auth', authRouter);
app.use('/api/content', contentRouter);

// Conexión a Mongo y arranque del servidor
const MONGO_URL = process.env.MONGO_URL || '';
const PORT = parseInt(process.env.PORT ?? '4000', 10);

mongoose
  .connect(MONGO_URL)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () =>
      console.log(`API running on http://localhost:${PORT}`),
    );
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });
