import { z } from 'zod';

/**
 * Request body validation schemas.
 * Applied before any processing to enforce size/format limits.
 */

export const ChatMessageSchema = z.object({
  sessionId: z.string().min(1).max(128),
  message: z.string().min(1).max(10000, 'Message must be 10,000 characters or fewer'),
  persona: z
    .enum(['default', 'first_principles', 'socratic', 'execution', 'devils_advocate', 'mindfulness'])
    .default('default')
    .optional(),
});

export const CreateSessionSchema = z.object({
  title: z.string().min(1).max(200).optional(),
});

export const SearchQuerySchema = z.object({
  q: z.string().min(1).max(500),
});
