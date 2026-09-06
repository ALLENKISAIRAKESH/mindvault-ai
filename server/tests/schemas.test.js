import { describe, it, expect } from 'vitest';
import { CreateSessionSchema, ChatMessageSchema, SearchQuerySchema } from '../src/schemas/request.js';
import { MemorySchema, MemoryUpdateSchema } from '../src/schemas/memory.js';
import { InsightSchema, validateInsight } from '../src/schemas/insight.js';

describe('Validation Schemas', () => {
  describe('CreateSessionSchema', () => {
    it('accepts valid session data', () => {
      const result = CreateSessionSchema.safeParse({ title: 'My Strategy Session' });
      expect(result.success).toBe(true);
    });

    it('allows empty payload and applies defaults', () => {
      const result = CreateSessionSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('rejects title that is too long', () => {
      const result = CreateSessionSchema.safeParse({ title: 'a'.repeat(201) });
      expect(result.success).toBe(false);
    });
  });

  describe('ChatMessageSchema', () => {
    it('accepts valid message with sessionId', () => {
      const result = ChatMessageSchema.safeParse({
        sessionId: 'session-123',
        message: 'What are my key goals?',
      });
      expect(result.success).toBe(true);
    });

    it('rejects empty message', () => {
      const result = ChatMessageSchema.safeParse({
        sessionId: 'session-123',
        message: '',
      });
      expect(result.success).toBe(false);
    });

    it('rejects missing sessionId', () => {
      const result = ChatMessageSchema.safeParse({ message: 'Hello' });
      expect(result.success).toBe(false);
    });
  });

  describe('MemorySchema', () => {
    it('accepts valid memory', () => {
      const result = MemorySchema.safeParse({
        text: 'I prefer concise technical summaries.',
        category: 'preference',
        importance: 'high',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid category', () => {
      const result = MemorySchema.safeParse({
        text: 'I am a developer',
        category: 'invalid_category',
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid importance level', () => {
      const result = MemorySchema.safeParse({
        text: 'Critical note',
        category: 'goal',
        importance: 'critical',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('InsightSchema & validateInsight', () => {
    it('validates structured AI extraction result', () => {
      const validInsight = {
        summary: 'Discussion on cloud migration roadmap and timeline.',
        goals: [{ title: 'Complete GCP migration', description: 'Finish migration by Q3' }],
        decisions: [{ title: 'Use Cloud Run', description: 'Fully managed and scalable' }],
        actions: [{ title: 'Set up IAM roles and Service Accounts', priority: 'high' }],
        patterns: [{ title: 'Focus on automation', evidence: 'Mentioned CI/CD multiple times' }],
      };

      const result = validateInsight(validInsight);
      expect(result.success).toBe(true);
      expect(result.data.summary).toBe('Discussion on cloud migration roadmap and timeline.');
    });

    it('rejects payload missing summary', () => {
      const invalid = {
        goals: [],
        decisions: [],
        actions: [],
        patterns: [],
      };
      const result = validateInsight(invalid);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
