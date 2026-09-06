import logger from '../lib/logger.js';

/**
 * Centralized error handler.
 * Returns safe messages to clients — never exposes stack traces,
 * internal paths, or sensitive information.
 */
export function errorHandler(err, req, res, _next) {
  const requestId = req.id || 'unknown';

  // Log the full error server-side
  logger.error(
    {
      requestId,
      error: err.message,
      stack: err.stack,
      route: req.originalUrl,
      method: req.method,
    },
    'Unhandled error'
  );

  // Determine status code
  const statusCode = err.statusCode || err.status || 500;

  // Safe client-facing messages
  const safeMessages = {
    400: 'Invalid request. Please check your input and try again.',
    401: 'Authentication required. Please sign in.',
    403: 'You do not have permission to access this resource.',
    404: 'The requested resource was not found.',
    409: 'A conflict occurred. Please try again.',
    413: 'Request too large. Please reduce the size of your input.',
    429: 'Too many requests. Please slow down and try again.',
    500: 'Unable to process your request right now. Please try again later.',
    503: 'Service temporarily unavailable. Please try again shortly.',
  };

  res.status(statusCode).json({
    error: safeMessages[statusCode] || safeMessages[500],
    requestId,
  });
}

/**
 * 404 handler for unknown routes.
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    error: 'The requested endpoint does not exist.',
  });
}
