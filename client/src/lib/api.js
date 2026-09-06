import { auth } from './firebase';

const API_BASE = '/api';

/**
 * Authenticated API client.
 * Automatically attaches Firebase ID token to every request.
 * All Gemini/Firestore calls go through this — never direct.
 */
async function getHeaders() {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Not authenticated');
  }
  const token = await user.getIdToken();
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

async function request(path, options = {}) {
  const headers = await getHeaders();
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...headers, ...options.headers },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `Request failed with status ${response.status}`);
  }

  return response.json();
}

// ── Auth ──
export const getMe = () => request('/me');

// ── Sessions ──
export const getSessions = () => request('/sessions');
export const getSession = (id) => request(`/sessions/${id}`);
export const createSession = (title) =>
  request('/sessions', {
    method: 'POST',
    body: JSON.stringify({ title }),
  });
export const deleteSession = (id) =>
  request(`/sessions/${id}`, { method: 'DELETE' });

// ── Chat ──
export const sendMessage = (sessionId, message, persona = 'default') =>
  request('/sessions/chat', {
    method: 'POST',
    body: JSON.stringify({ sessionId, message, persona }),
  });

// ── Summarize ──
export const summarizeSession = (sessionId) =>
  request(`/sessions/${sessionId}/summarize`, { method: 'POST' });

// ── Insights ──
export const getInsights = () => request('/insights');

// ── Memories ──
export const getMemories = () => request('/memories');
export const createMemory = (data) =>
  request('/memories', {
    method: 'POST',
    body: JSON.stringify(data),
  });
export const updateMemory = (id, data) =>
  request(`/memories/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
export const deleteMemory = (id) =>
  request(`/memories/${id}`, { method: 'DELETE' });

// ── Search ──
export const search = (query) => request(`/search?q=${encodeURIComponent(query)}`);

// ── Security ──
export const getSecurityStatus = () => request('/security/status');
