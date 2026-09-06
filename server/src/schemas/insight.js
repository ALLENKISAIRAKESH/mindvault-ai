import { z } from 'zod';

/**
 * Insight schema — validates Gemini-generated structured insights.
 * If Gemini returns malformed data, validation fails and we retry or reject.
 */

export const GoalSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().min(1).max(2000),
});

export const DecisionSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().min(1).max(2000),
});

export const ActionSchema = z.object({
  title: z.string().min(1).max(500),
  priority: z.enum(['low', 'medium', 'high']),
});

export const PatternSchema = z.object({
  title: z.string().min(1).max(500),
  evidence: z.string().min(1).max(2000),
});

export const InsightSchema = z.object({
  summary: z.string().min(1).max(5000),
  goals: z.array(GoalSchema).default([]),
  decisions: z.array(DecisionSchema).default([]),
  actions: z.array(ActionSchema).default([]),
  patterns: z.array(PatternSchema).default([]),
});

/**
 * Validate Gemini insight output.
 * Returns { success: true, data } or { success: false, error }.
 */
export function validateInsight(data) {
  const result = InsightSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    error: result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
  };
}
