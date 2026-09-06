import admin from 'firebase-admin';
import { LocalFirestore } from './localStore.js';
import logger from '../../lib/logger.js';

let initialized = false;
let isRealFirestore = false;
const localDb = new LocalFirestore();

/**
 * Initialize Firebase Admin SDK.
 * Uses Application Default Credentials on Cloud Run or with GOOGLE_APPLICATION_CREDENTIALS.
 * Falls back to persistent local storage for seamless local development.
 */
export function initFirestore() {
  if (initialized) {
    return isRealFirestore ? admin.firestore() : localDb;
  }

  try {
    if (admin.apps.length === 0) {
      admin.initializeApp({
        projectId: process.env.GOOGLE_CLOUD_PROJECT || process.env.VITE_FIREBASE_PROJECT_ID || 'gen-ai-58731',
      });
    }

    // Test whether Firestore ADC is configured
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.NODE_ENV === 'production') {
      const db = admin.firestore();
      isRealFirestore = true;
      initialized = true;
      logger.info('Connected to Google Cloud Firestore');
      return db;
    } else {
      logger.info('Using local development Firestore storage');
      initialized = true;
      isRealFirestore = false;
      return localDb;
    }
  } catch (error) {
    logger.info({ message: error.message }, 'Using local development Firestore storage');
    initialized = true;
    isRealFirestore = false;
    return localDb;
  }
}

/**
 * Get Firestore instance.
 */
export function getDb() {
  return initFirestore();
}
