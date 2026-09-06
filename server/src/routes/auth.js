import { Router } from 'express';
import { getOrCreateUserProfile } from '../services/firestore/users.js';

const router = Router();

/**
 * GET /api/me
 * Returns the authenticated user's profile.
 * UID comes from verified Firebase token, NEVER from request body.
 */
router.get('/', async (req, res, next) => {
  try {
    const profile = await getOrCreateUserProfile(req.user.uid, req.user);
    res.json({ user: profile });
  } catch (error) {
    next(error);
  }
});

export default router;
