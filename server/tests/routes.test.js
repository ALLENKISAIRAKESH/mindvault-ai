import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/index.js';

describe('API Route Security & Behavior', () => {
  describe('Public Routes', () => {
    it('GET /api/health returns healthy status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'healthy');
      expect(res.body).toHaveProperty('timestamp');
      expect(res.body).toHaveProperty('uptime');
    });
  });

  describe('Authentication Enforcement (401 on unauthenticated access)', () => {
    it('GET /api/me returns 401 without auth header', async () => {
      const res = await request(app).get('/api/me');
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error', 'Authentication required');
    });

    it('GET /api/sessions returns 401 without auth header', async () => {
      const res = await request(app).get('/api/sessions');
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error', 'Authentication required');
    });

    it('POST /api/sessions returns 401 without auth header', async () => {
      const res = await request(app).post('/api/sessions').send({ title: 'Hacked' });
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error', 'Authentication required');
    });

    it('GET /api/insights returns 401 without auth header', async () => {
      const res = await request(app).get('/api/insights');
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error', 'Authentication required');
    });

    it('GET /api/memories returns 401 without auth header', async () => {
      const res = await request(app).get('/api/memories');
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error', 'Authentication required');
    });

    it('GET /api/search returns 401 without auth header', async () => {
      const res = await request(app).get('/api/search?q=test');
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error', 'Authentication required');
    });

    it('GET /api/security returns 401 without auth header', async () => {
      const res = await request(app).get('/api/security');
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error', 'Authentication required');
    });

    it('rejects malformed Bearer tokens with 401', async () => {
      const res = await request(app)
        .get('/api/me')
        .set('Authorization', 'Bearer invalid_fake_token_12345');
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error', 'Invalid token');
    });
  });

  describe('Security Headers', () => {
    it('includes Helmet security headers in responses', async () => {
      const res = await request(app).get('/api/health');
      expect(res.headers).toHaveProperty('x-content-type-options', 'nosniff');
      expect(res.headers).toHaveProperty('x-frame-options', 'SAMEORIGIN');
    });
  });
});
