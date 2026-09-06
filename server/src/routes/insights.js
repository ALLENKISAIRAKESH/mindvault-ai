import { Router } from 'express';
import * as insightService from '../services/firestore/insights.js';

const router = Router();

/**
 * GET /api/insights
 * Get all insights for the authenticated user.
 */
router.get('/', async (req, res, next) => {
  try {
    const insights = await insightService.getInsights(req.user.uid);
    res.json({ insights });
  } catch (error) {
    next(error);
  }
});

export default router;
