import { z } from 'zod';

export const MemorySchema = z.object({
  text: z.string().min(1).max(2000),
  category: z.enum([
    'preference',
    'goal',
    'project',
    'habit',
    'decision',
    'personal_context',
  ]),
  importance: z.enum(['low', 'medium', 'high']).default('medium'),
});

export const MemoryUpdateSchema = z.object({
  text: z.string().min(1).max(2000).optional(),
  category: z
    .enum(['preference', 'goal', 'project', 'habit', 'decision', 'personal_context'])
    .optional(),
  importance: z.enum(['low', 'medium', 'high']).optional(),
  active: z.boolean().optional(),
});
