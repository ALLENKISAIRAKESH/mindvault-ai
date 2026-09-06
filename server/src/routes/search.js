import { Router } from 'express';
import { SearchQuerySchema } from '../schemas/request.js';
import { getDb } from '../services/firestore/client.js';

const router = Router();

/**
 * GET /api/search?q=
 * Search across the authenticated user's sessions, memories, and insights.
 * NEVER searches globally across users.
 */
router.get('/', async (req, res, next) => {
  try {
    const parsed = SearchQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Search query is required (1-500 characters).' });
    }

    const { q } = parsed.data;
    const uid = req.user.uid;
    const db = getDb();
    const queryLower = q.toLowerCase();

    const results = {
      sessions: [],
      memories: [],
      insights: [],
    };

    // Search sessions by title
    const sessionsSnap = await db
      .collection('users')
      .doc(uid)
      .collection('sessions')
      .orderBy('updatedAt', 'desc')
      .limit(50)
      .get();

    results.sessions = sessionsSnap.docs
      .filter((doc) => {
        const data = doc.data();
        const titleMatch = (data.title || '').toLowerCase().includes(queryLower);
        const summaryMatch = (data.summary || '').toLowerCase().includes(queryLower);
        return titleMatch || summaryMatch;
      })
      .map((doc) => ({ id: doc.id, type: 'session', ...doc.data() }))
      .slice(0, 10);

    // Search memories by text
    const memoriesSnap = await db
      .collection('users')
      .doc(uid)
      .collection('memories')
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get();

    results.memories = memoriesSnap.docs
      .filter((doc) => {
        const data = doc.data();
        return (data.text || '').toLowerCase().includes(queryLower);
      })
      .map((doc) => ({ id: doc.id, type: 'memory', ...doc.data() }))
      .slice(0, 10);

    // Search insights by summary
    const insightsSnap = await db
      .collection('users')
      .doc(uid)
      .collection('insights')
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();

    results.insights = insightsSnap.docs
      .filter((doc) => {
        const data = doc.data();
        const summaryMatch = (data.summary || '').toLowerCase().includes(queryLower);
        const goalMatch = (data.goals || []).some(
          (g) =>
            g.title.toLowerCase().includes(queryLower) ||
            g.description.toLowerCase().includes(queryLower)
        );
        return summaryMatch || goalMatch;
      })
      .map((doc) => ({ id: doc.id, type: 'insight', ...doc.data() }))
      .slice(0, 10);

    res.json({ query: q, results });
  } catch (error) {
    next(error);
  }
});

export default router;
