import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';

/**
 * Firebase configuration.
 * These are PUBLIC client-side identifiers — NOT secrets.
 * Replace with your Firebase project config.
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDvEIOCw9dfzrSPafJK4PW2Cu6MjEPEb98',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'gen-ai-58731.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'gen-ai-58731',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'gen-ai-58731.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '201042354457',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:201042354457:web:09ade0b849a8a31e086588',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-G5X3Y86TC3',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
};
