import { randomUUID } from 'crypto';
import logger from '../lib/logger.js';

/**
 * Structured request logger.
 * Assigns a requestId, logs method/route/status/latency.
 * NEVER logs auth tokens, secrets, or full message bodies.
 */
export function requestLogger(req, res, next) {
  req.id = randomUUID();
  const start = Date.now();

  res.on('finish', () => {
    const latency = Date.now() - start;

    logger.info({
      requestId: req.id,
      method: req.method,
      route: req.originalUrl,
      status: res.statusCode,
      latency: `${latency}ms`,
      userAgent: req.headers['user-agent']?.substring(0, 100),
    });
  });

  next();
}
