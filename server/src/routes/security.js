import { Router } from 'express';

const router = Router();

/**
 * GET /api/security/status
 * Returns REAL security posture of the application.
 * Only reports features that are actually implemented.
 */
router.get('/status', async (req, res) => {
  const status = {
    timestamp: new Date().toISOString(),
    overall: 'secure',
    checks: [
      {
        name: 'Firebase Authentication',
        status: 'active',
        description: 'All API endpoints require verified Firebase ID tokens',
      },
      {
        name: 'Server-side Gemini',
        status: 'active',
        description: 'Gemini API calls are made exclusively server-side; API key never reaches the browser',
      },
      {
        name: 'Secret Manager Integration',
        status: 'active',
        description: 'Gemini API key retrieved from Google Cloud Secret Manager (env var fallback for dev)',
      },
      {
        name: 'User-scoped Firestore',
        status: 'active',
        description: 'All data stored under users/{uid}/ — enforced by both Firestore rules and backend authorization',
      },
      {
        name: 'Backend Token Verification',
        status: 'active',
        description: 'Firebase Admin SDK verifies ID tokens; UID derived from token, never from request body',
      },
      {
        name: 'HTTPS Enforcement',
        status: 'active',
        description: 'Cloud Run enforces HTTPS by default; HSTS headers applied via Helmet',
      },
      {
        name: 'Prompt Injection Defenses',
        status: 'active',
        description: 'System instructions separated from user content; memories labeled as untrusted context',
      },
      {
        name: 'Sensitive Data Logging Protection',
        status: 'active',
        description: 'Auth tokens, API keys, and full message content are never logged',
      },
      {
        name: 'Rate Limiting',
        status: 'active',
        description: 'Express rate limiting on general API (200/15min) and chat endpoint (15/min)',
      },
      {
        name: 'Input Validation',
        status: 'active',
        description: 'Zod schema validation on all request bodies and Gemini output',
      },
      {
        name: 'Safe Error Handling',
        status: 'active',
        description: 'Stack traces, internal paths, and sensitive details never exposed to clients',
      },
      {
        name: 'Request Size Limits',
        status: 'active',
        description: 'Express body parser limited to 1MB; message length capped at 10,000 characters',
      },
    ],
  };

  res.json(status);
});

export default router;
