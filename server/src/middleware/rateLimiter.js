import rateLimit from 'express-rate-limit';

/**
 * General API rate limiter.
 * In-memory store — suitable for single Cloud Run instance.
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
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
  max: 15,
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
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many authentication attempts. Please try again later.',
  },
});
