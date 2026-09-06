import { getDb } from './client.js';
import { randomUUID } from 'crypto';

/**
 * Create a new memory.
 */
export async function createMemory(uid, memoryData) {
  const db = getDb();
  const memoryId = randomUUID();
  const memoryRef = db.collection('users').doc(uid).collection('memories').doc(memoryId);

  const memory = {
    text: memoryData.text,
    category: memoryData.category,
    importance: memoryData.importance || 'medium',
    sourceSessionId: memoryData.sourceSessionId || null,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await memoryRef.set(memory);
  return { id: memoryId, ...memory };
}

/**
 * Get all memories for a user.
 */
export async function getMemories(uid, activeOnly = false) {
  const db = getDb();
  let query = db.collection('users').doc(uid).collection('memories').orderBy('createdAt', 'desc');

  if (activeOnly) {
    query = query.where('active', '==', true);
  }

  const snapshot = await query.limit(100).get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

/**
 * Get active memories for Gemini context.
 * Returns only active memories, limited for token efficiency.
 */
export async function getActiveMemories(uid, limit = 20) {
  const db = getDb();
  const snapshot = await db
    .collection('users')
    .doc(uid)
    .collection('memories')
    .where('active', '==', true)
    .orderBy('createdAt', 'desc')
    .limit(limit)
    .get();

  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

/**
 * Update a memory.
 */
export async function updateMemory(uid, memoryId, updates) {
  const db = getDb();
  const memoryRef = db.collection('users').doc(uid).collection('memories').doc(memoryId);
  const doc = await memoryRef.get();

  if (!doc.exists) {
    return null;
  }

  await memoryRef.update({
    ...updates,
    updatedAt: new Date().toISOString(),
  });

  const updated = await memoryRef.get();
  return { id: updated.id, ...updated.data() };
}

/**
 * Delete a memory permanently.
 */
export async function deleteMemory(uid, memoryId) {
  const db = getDb();
  const memoryRef = db.collection('users').doc(uid).collection('memories').doc(memoryId);
  const doc = await memoryRef.get();

  if (!doc.exists) {
    return false;
  }

  await memoryRef.delete();
  return true;
}
