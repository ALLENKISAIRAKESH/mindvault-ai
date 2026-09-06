import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from workspace root or current directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

import { initFirestore } from './services/firestore/client.js';
import { authMiddleware } from './middleware/auth.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import { requestLogger } from './middleware/requestLogger.js';
import logger from './lib/logger.js';

// Routes
import healthRouter from './routes/health.js';
import authRouter from './routes/auth.js';
import sessionsRouter from './routes/sessions.js';
import insightsRouter from './routes/insights.js';
import memoriesRouter from './routes/memories.js';
import searchRouter from './routes/search.js';
import securityRouter from './routes/security.js';

const app = express();
const PORT = process.env.PORT || 8080;

// ── Security Headers ──
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", 'https://apis.google.com', 'https://www.gstatic.com'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
        connectSrc: [
          "'self'",
          'https://*.googleapis.com',
          'https://*.firebaseio.com',
          'https://*.firebaseapp.com',
          'wss://*.firebaseio.com',
          'https://identitytoolkit.googleapis.com',
          'https://securetoken.googleapis.com',
        ],
        frameSrc: ["'self'", 'https://*.firebaseapp.com', 'https://accounts.google.com'],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// ── CORS ──
app.use(
  cors({
    origin: process.env.NODE_ENV === 'production'
      ? process.env.ALLOWED_ORIGIN || true
      : ['http://localhost:5173', 'http://localhost:8080'],
    credentials: true,
  })
);

// ── Body Parsing (with size limit) ──
app.use(express.json({ limit: '1mb' }));

// ── Request Logging ──
app.use(requestLogger);

// ── Rate Limiting ──
app.use('/api/', generalLimiter);

// ── Initialize Firebase Admin ──
try {
  initFirestore();
} catch (error) {
  logger.warn({ error: error.message }, 'Firebase init deferred — will retry on first request');
}

// ═══════════════════════════════════════
// PUBLIC ROUTES
// ═══════════════════════════════════════
app.use('/api/health', healthRouter);

// ═══════════════════════════════════════
// AUTHENTICATED ROUTES
// ═══════════════════════════════════════
app.use('/api/me', authMiddleware, authRouter);
app.use('/api/sessions', authMiddleware, sessionsRouter);
app.use('/api/insights', authMiddleware, insightsRouter);
app.use('/api/memories', authMiddleware, memoriesRouter);
app.use('/api/search', authMiddleware, searchRouter);
app.use('/api/security', authMiddleware, securityRouter);

// ═══════════════════════════════════════
// SERVE FRONTEND (production)
// ═══════════════════════════════════════
const publicPath = path.join(__dirname, '..', 'public');
app.use(express.static(publicPath));

// SPA fallback — serve index.html for non-API routes
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// ═══════════════════════════════════════
// ERROR HANDLING
// ═══════════════════════════════════════
app.use('/api/*', notFoundHandler);
app.use(errorHandler);

// ═══════════════════════════════════════
// START SERVER
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    logger.info({ port: PORT, env: process.env.NODE_ENV || 'development' }, '🧠 MindVault AI server started');
  });
}

export default app;
