import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import logger from '../../lib/logger.js';

let cachedApiKey = null;
let cacheExpiry = 0;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

/**
 * Retrieve the Gemini API key.
 * Priority:
 *   1. Google Cloud Secret Manager (production)
 *   2. GEMINI_API_KEY environment variable (local development)
 *
 * Caches the key in memory for 1 hour to reduce Secret Manager calls.
 */
export async function getGeminiApiKey() {
  // Return cached key if still valid
  if (cachedApiKey && Date.now() < cacheExpiry) {
    return cachedApiKey;
  }

  // Try Secret Manager first (production)
  const projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCP_PROJECT_ID;

  if (projectId) {
    try {
      const client = new SecretManagerServiceClient();
      const secretName = `projects/${projectId}/secrets/GEMINI_API_KEY/versions/latest`;
      const [version] = await client.accessSecretVersion({ name: secretName });
      const apiKey = version.payload.data.toString('utf8');

      cachedApiKey = apiKey;
      cacheExpiry = Date.now() + CACHE_TTL;
      logger.info('Gemini API key loaded from Secret Manager');
      return apiKey;
    } catch (error) {
      logger.warn(
        { errorMessage: error.message },
        'Failed to load from Secret Manager, falling back to env var'
      );
    }
  }

  // Fallback: environment variable (local development)
  const envKey = process.env.GEMINI_API_KEY;
  if (envKey) {
    cachedApiKey = envKey;
    cacheExpiry = Date.now() + CACHE_TTL;
    logger.info('Gemini API key loaded from environment variable');
    return envKey;
  }

  throw new Error(
    'Gemini API key not found. Set GEMINI_API_KEY env var or configure Secret Manager.'
  );
}

/**
 * Clear cached key (for testing or rotation).
 */
export function clearKeyCache() {
  cachedApiKey = null;
  cacheExpiry = 0;
}
