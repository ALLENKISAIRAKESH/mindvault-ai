import rateLimit from 'express-rate-limit';

const isDev = process.env.NODE_ENV !== 'production';

/**
 * General API rate limiter.
 * In-memory store — suitable for single Cloud Run instance.
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 10000 : 2000,
  skip: () => isDev,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests. Please slow down and try again.',
  },
});

/**
 * Chat endpoint rate limiter — more restrictive since it calls Gemini.
 */
export const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: isDev ? 500 : 60,
  skip: () => isDev,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many chat requests. Please wait a moment before sending another message.',
  },
});

/**
 * Auth endpoint rate limiter — prevent brute force.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 500 : 60,
  skip: () => isDev,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many authentication attempts. Please try again later.',
  },
});
