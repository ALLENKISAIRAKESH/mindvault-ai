import { Router } from 'express';

const router = Router();

/**
 * GET /api/health
 * Public health check endpoint.
 */
router.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'mindvault-ai',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

export default router;
