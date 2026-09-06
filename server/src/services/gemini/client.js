import { GoogleGenerativeAI } from '@google/generative-ai';
import { getGeminiApiKey } from '../secrets/manager.js';
import {
  JOURNAL_SYSTEM_PROMPT,
  INSIGHT_EXTRACTION_PROMPT,
  buildMemoryContext,
  getSystemPromptForPersona,
} from './prompts.js';
import { validateInsight } from '../../schemas/insight.js';
import logger from '../../lib/logger.js';

const MODEL_NAME = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const MAX_OUTPUT_TOKENS = 4096;
const TEMPERATURE = 0.7;
const TIMEOUT_MS = 30000;

let genAIInstance = null;

/**
 * Get or create GoogleGenerativeAI instance.
 */
async function getGenAI() {
  if (genAIInstance) return genAIInstance;
  const apiKey = await getGeminiApiKey();
  genAIInstance = new GoogleGenerativeAI(apiKey);
  return genAIInstance;
}

/**
 * Reset instance (for key rotation or testing).
 */
export function resetGeminiClient() {
  genAIInstance = null;
}

/**
 * Send a multi-turn conversation message to Gemini.
 *
 * @param {Array} messageHistory - Previous messages [{role, content}]
 * @param {string} newMessage - The new user message
 * @param {Array} memories - Active user memories for context
 * @param {string} persona - AI Thinking Persona ('default', 'first_principles', etc.)
 * @returns {string} Gemini's response text
 */
export async function chat(messageHistory, newMessage, memories = [], persona = 'default') {
  const genAI = await getGenAI();

  const systemInstruction = getSystemPromptForPersona(persona, memories);

  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    systemInstruction,
    generationConfig: {
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      temperature: TEMPERATURE,
    },
  });

  // Build conversation history for multi-turn
  const history = messageHistory.map((msg) => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }],
  }));

  const chatSession = model.startChat({ history });

  // Send with timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const result = await chatSession.sendMessage(newMessage);
    clearTimeout(timeoutId);

    const response = result.response;
    const text = response.text();

    if (!text || text.trim().length === 0) {
      throw new Error('Empty response from Gemini');
    }

    logger.debug({ responseLength: text.length }, 'Gemini chat response received');
    return text;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      logger.error('Gemini request timed out');
      throw new Error('AI request timed out. Please try again.');
    }

    logger.error({ errorMessage: error.message }, 'Gemini chat error');
    throw new Error('Unable to get AI response. Please try again.');
  }
}

/**
 * Extract structured insights from a conversation.
 * Validates output with Zod. Retries once on validation failure.
 *
 * @param {Array} messages - Conversation messages [{role, content}]
 * @returns {object} Validated insight data
 */
export async function extractInsights(messages) {
  const genAI = await getGenAI();

  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    generationConfig: {
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      temperature: 0.3, // Lower temperature for structured output
      responseMimeType: 'application/json',
    },
  });

  // Format conversation for analysis
  const conversationText = messages
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join('\n\n');

  const prompt = `${INSIGHT_EXTRACTION_PROMPT}\n\n--- CONVERSATION ---\n${conversationText}\n--- END CONVERSATION ---`;

  // Attempt extraction with one retry on validation failure
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();

      // Parse JSON from response
      let parsed;
      try {
        // Strip any markdown code fences if present
        const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        parsed = JSON.parse(cleaned);
      } catch {
        logger.warn(
          { attempt, responsePreview: text.substring(0, 200) },
          'Failed to parse Gemini insight JSON'
        );
        if (attempt === 0) continue;
        throw new Error('Failed to parse AI insights');
      }

      // Validate with Zod
      const validation = validateInsight(parsed);
      if (validation.success) {
        logger.info({ attempt }, 'Insight extraction successful');
        return validation.data;
      }

      logger.warn(
        { attempt, validationError: validation.error },
        'Insight validation failed'
      );
      if (attempt === 0) continue;
      throw new Error('AI generated malformed insight data');
    } catch (error) {
      if (attempt === 1) {
        logger.error({ errorMessage: error.message }, 'Insight extraction failed after retry');
        throw new Error('Unable to extract insights. Please try again.');
      }
    }
  }
}

/**
 * Generate a session summary.
 */
export async function summarizeSession(messages) {
  const genAI = await getGenAI();

  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    generationConfig: {
      maxOutputTokens: 1024,
      temperature: 0.3,
    },
  });

  const conversationText = messages
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join('\n\n');

  const prompt = `Provide a concise but comprehensive summary of this conversation in 2-4 paragraphs. Focus on the key topics discussed, decisions made, and any important outcomes or next steps.\n\n--- CONVERSATION ---\n${conversationText}\n--- END CONVERSATION ---`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    if (!text || text.trim().length === 0) {
      throw new Error('Empty summary response');
    }

    return text.trim();
  } catch (error) {
    logger.error({ errorMessage: error.message }, 'Summary generation failed');
    throw new Error('Unable to generate summary. Please try again.');
  }
}
