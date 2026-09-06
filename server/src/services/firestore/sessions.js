import { getDb } from './client.js';
import { randomUUID } from 'crypto';

const MAX_MESSAGES_PER_SESSION = 100;

/**
 * Create a new session.
 */
export async function createSession(uid, title) {
  const db = getDb();
  const sessionId = randomUUID();
  const sessionRef = db.collection('users').doc(uid).collection('sessions').doc(sessionId);

  const session = {
    title: title || 'New Session',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messageCount: 0,
    summary: null,
    insightId: null,
  };

  await sessionRef.set(session);
  return { id: sessionId, ...session };
}

/**
 * Get all sessions for a user, ordered by most recent.
 */
export async function getSessions(uid) {
  const db = getDb();
  const snapshot = await db
    .collection('users')
    .doc(uid)
    .collection('sessions')
    .orderBy('updatedAt', 'desc')
    .limit(50)
    .get();

  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

/**
 * Get a single session with its messages.
 */
export async function getSession(uid, sessionId) {
  const db = getDb();
  const sessionRef = db.collection('users').doc(uid).collection('sessions').doc(sessionId);
  const sessionDoc = await sessionRef.get();

  if (!sessionDoc.exists) {
    return null;
  }

  // Get messages ordered by creation time
  const messagesSnapshot = await sessionRef
    .collection('messages')
    .orderBy('createdAt', 'asc')
    .limit(MAX_MESSAGES_PER_SESSION)
    .get();

  const messages = messagesSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return {
    id: sessionDoc.id,
    ...sessionDoc.data(),
    messages,
  };
}

/**
 * Delete a session and all its messages.
 */
export async function deleteSession(uid, sessionId) {
  const db = getDb();
  const sessionRef = db.collection('users').doc(uid).collection('sessions').doc(sessionId);
  const sessionDoc = await sessionRef.get();

  if (!sessionDoc.exists) {
    return false;
  }

  // Delete all messages in the session
  const messagesSnapshot = await sessionRef.collection('messages').get();
  const batch = db.batch();
  messagesSnapshot.docs.forEach((doc) => batch.delete(doc.ref));
  batch.delete(sessionRef);
  await batch.commit();

  return true;
}

/**
 * Add a message to a session.
 */
export async function addMessage(uid, sessionId, role, content) {
  const db = getDb();
  const sessionRef = db.collection('users').doc(uid).collection('sessions').doc(sessionId);
  const sessionDoc = await sessionRef.get();

  if (!sessionDoc.exists) {
    throw new Error('Session not found');
  }

  const messageId = randomUUID();
  const messageRef = sessionRef.collection('messages').doc(messageId);

  const message = {
    role,
    content,
    createdAt: new Date().toISOString(),
  };

  await messageRef.set(message);

  // Update session metadata
  await sessionRef.update({
    updatedAt: new Date().toISOString(),
    messageCount: (sessionDoc.data().messageCount || 0) + 1,
    // Auto-title from first user message if still default
    ...(sessionDoc.data().title === 'New Session' && role === 'user'
      ? { title: content.substring(0, 80) + (content.length > 80 ? '...' : '') }
      : {}),
  });

  return { id: messageId, ...message };
}

/**
 * Get messages for a session (for Gemini context).
 * Returns most recent messages up to the limit.
 */
export async function getSessionMessages(uid, sessionId, limit = 30) {
  const db = getDb();
  const snapshot = await db
    .collection('users')
    .doc(uid)
    .collection('sessions')
    .doc(sessionId)
    .collection('messages')
    .orderBy('createdAt', 'asc')
    .limit(limit)
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

/**
 * Update session summary and/or insight reference.
 */
export async function updateSession(uid, sessionId, updates) {
  const db = getDb();
  const sessionRef = db.collection('users').doc(uid).collection('sessions').doc(sessionId);
  await sessionRef.update({
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}
