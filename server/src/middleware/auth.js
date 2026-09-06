import admin from 'firebase-admin';
import logger from '../lib/logger.js';

/**
 * Authentication middleware.
 * Verifies Firebase ID token from Authorization header.
 * Attaches verified user to req.user.
 * NEVER trusts UID from request body/query/path.
 */
export async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'Please sign in to access this resource.',
    });
  }

  const idToken = authHeader.split('Bearer ')[1];

  if (!idToken) {
    return res.status(401).json({
      error: 'Invalid token format',
      message: 'Please sign in again.',
    });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // Attach ONLY verified identity — this is the source of truth
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || null,
      name: decodedToken.name || null,
      picture: decodedToken.picture || null,
      emailVerified: decodedToken.email_verified || false,
    };

    next();
  } catch (error) {
    logger.warn({ errorCode: error.code }, 'Token verification failed');

    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        error: 'Token expired',
        message: 'Your session has expired. Please sign in again.',
      });
    }

    return res.status(401).json({
      error: 'Invalid token',
      message: 'Authentication failed. Please sign in again.',
    });
  }
}
