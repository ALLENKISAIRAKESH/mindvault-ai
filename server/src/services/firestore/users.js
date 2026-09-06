import { getDb } from './client.js';

/**
 * Get or create user profile document.
 * Always scoped to users/{uid}.
 */
export async function getOrCreateUserProfile(uid, userData = {}) {
  const db = getDb();
  const userRef = db.collection('users').doc(uid);
  const doc = await userRef.get();

  if (doc.exists) {
    return { id: doc.id, ...doc.data() };
  }

  const profile = {
    email: userData.email || null,
    displayName: userData.name || null,
    photoURL: userData.picture || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    settings: {
      theme: 'dark',
      notifications: true,
    },
  };

  await userRef.set(profile);
  return { id: uid, ...profile };
}

/**
 * Update user profile.
 */
export async function updateUserProfile(uid, updates) {
  const db = getDb();
  const userRef = db.collection('users').doc(uid);
  await userRef.update({
    ...updates,
    updatedAt: new Date().toISOString(),
  });
  const doc = await userRef.get();
  return { id: doc.id, ...doc.data() };
}
