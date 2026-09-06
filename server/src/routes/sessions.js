import { Router } from 'express';
import { CreateSessionSchema, ChatMessageSchema } from '../schemas/request.js';
import * as sessionService from '../services/firestore/sessions.js';
import * as memoryService from '../services/firestore/memories.js';
import * as insightService from '../services/firestore/insights.js';
import * as gemini from '../services/gemini/client.js';
import { chatLimiter } from '../middleware/rateLimiter.js';
import logger from '../lib/logger.js';

const router = Router();

/**
 * GET /api/sessions
 * List all sessions for the authenticated user.
 */
router.get('/', async (req, res, next) => {
  try {
    const sessions = await sessionService.getSessions(req.user.uid);
    res.json({ sessions });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/sessions
 * Create a new session.
 */
router.post('/', async (req, res, next) => {
  try {
    const parsed = CreateSessionSchema.safeParse(req.body);
    const title = parsed.success ? parsed.data.title : undefined;
    const session = await sessionService.createSession(req.user.uid, title);
    res.status(201).json({ session });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/sessions/:id
 * Get a single session with all messages.
 */
router.get('/:id', async (req, res, next) => {
  try {
    const session = await sessionService.getSession(req.user.uid, req.params.id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found.' });
    }
    res.json({ session });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/sessions/:id
 * Delete a session and all its messages.
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const deleted = await sessionService.deleteSession(req.user.uid, req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Session not found.' });
    }
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/chat
 * Send a message to Gemini in a session context.
 * Rate-limited more aggressively than other endpoints.
 */
router.post('/chat', chatLimiter, async (req, res, next) => {
  try {
    // Validate request body
    const parsed = ChatMessageSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Invalid request. Message is required and must be under 10,000 characters.',
      });
    }

    const { sessionId, message, persona = 'default' } = parsed.data;
    const uid = req.user.uid;

    // Verify session exists and belongs to user
    const session = await sessionService.getSession(uid, sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found.' });
    }

    // Save user message
    await sessionService.addMessage(uid, sessionId, 'user', message);

    // Get conversation history (bounded)
    const messageHistory = await sessionService.getSessionMessages(uid, sessionId, 30);

    // Get active memories for context
    const memories = await memoryService.getActiveMemories(uid, 20);

    // Call Gemini with selected thinking persona
    const response = await gemini.chat(
      messageHistory.slice(0, -1), // Exclude the message we just added
      message,
      memories,
      persona
    );

    // Save assistant response
    const savedMessage = await sessionService.addMessage(uid, sessionId, 'assistant', response);

    res.json({
      message: {
        id: savedMessage.id,
        role: 'assistant',
        content: response,
        createdAt: savedMessage.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/sessions/:id/summarize
 * Generate summary and structured insights for a session.
 */
router.post('/:id/summarize', async (req, res, next) => {
  try {
    const uid = req.user.uid;
    const sessionId = req.params.id;

    // Get session with messages
    const session = await sessionService.getSession(uid, sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found.' });
    }

    if (!session.messages || session.messages.length < 2) {
      return res.status(400).json({
        error: 'Session needs at least one exchange before generating insights.',
      });
    }

    // Generate summary
    const summary = await gemini.summarizeSession(session.messages);

    // Extract structured insights
    const insights = await gemini.extractInsights(session.messages);

    // Save summary to session
    await sessionService.updateSession(uid, sessionId, { summary });

    // Save insights
    const savedInsight = await insightService.saveInsight(uid, sessionId, insights);

    // Update session with insight reference
    await sessionService.updateSession(uid, sessionId, { insightId: savedInsight.id });

    logger.info({ sessionId, insightId: savedInsight.id }, 'Session summarized with insights');

    res.json({
      summary,
      insight: savedInsight,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
