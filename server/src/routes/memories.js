import { Router } from 'express';
import { MemorySchema, MemoryUpdateSchema } from '../schemas/memory.js';
import * as memoryService from '../services/firestore/memories.js';

const router = Router();

/**
 * GET /api/memories
 * Get all memories for the authenticated user.
 */
router.get('/', async (req, res, next) => {
  try {
    const memories = await memoryService.getMemories(req.user.uid);
    res.json({ memories });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/memories
 * Create a new memory.
 */
router.post('/', async (req, res, next) => {
  try {
    const parsed = MemorySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Invalid memory data. Text and category are required.',
        details: parsed.error.issues.map((i) => i.message),
      });
    }

    const memory = await memoryService.createMemory(req.user.uid, parsed.data);
    res.status(201).json({ memory });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/memories/:id
 * Update a memory (e.g., toggle active/inactive).
 */
router.patch('/:id', async (req, res, next) => {
  try {
    const parsed = MemoryUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid update data.' });
    }

    const memory = await memoryService.updateMemory(req.user.uid, req.params.id, parsed.data);
    if (!memory) {
      return res.status(404).json({ error: 'Memory not found.' });
    }
    res.json({ memory });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/memories/:id
 * Delete a memory permanently.
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const deleted = await memoryService.deleteMemory(req.user.uid, req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Memory not found.' });
    }
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
