import { getDb } from './client.js';
import { randomUUID } from 'crypto';

/**
 * Save structured insights for a session.
 */
export async function saveInsight(uid, sessionId, insightData) {
  const db = getDb();
  const insightId = randomUUID();
  const insightRef = db.collection('users').doc(uid).collection('insights').doc(insightId);

  const insight = {
    sessionId,
    summary: insightData.summary,
    goals: insightData.goals || [],
    decisions: insightData.decisions || [],
    actions: insightData.actions || [],
    patterns: insightData.patterns || [],
    createdAt: new Date().toISOString(),
  };

  await insightRef.set(insight);
  return { id: insightId, ...insight };
}

/**
 * Get all insights for a user.
 */
export async function getInsights(uid) {
  const db = getDb();
  const snapshot = await db
    .collection('users')
    .doc(uid)
    .collection('insights')
    .orderBy('createdAt', 'desc')
    .limit(50)
    .get();

  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

/**
 * Get insight for a specific session.
 */
export async function getInsightBySession(uid, sessionId) {
  const db = getDb();
  const snapshot = await db
    .collection('users')
    .doc(uid)
    .collection('insights')
    .where('sessionId', '==', sessionId)
    .limit(1)
    .get();

  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() };
}
