import { z } from 'zod';

export const TELEMETRY_EVENTS = ['deploy', 'post', 'call', 'scan', 'error'] as const;
export type TelemetryEventName = (typeof TELEMETRY_EVENTS)[number];

export const TELEMETRY_CATEGORIES = [
  'productivity',
  'research',
  'content',
  'developer',
  'voice',
  'swarm',
  'analytics',
  'marketing',
  'education',
  'other',
] as const;

/**
 * Wire contract between grok-install-cli v2+ and the marketplace.
 * Kept intentionally narrow — anything PII-adjacent is rejected at the boundary.
 */
export const telemetryPayloadSchema = z.object({
  event: z.enum(TELEMETRY_EVENTS),
  timestamp: z.string().datetime({ offset: true }),
  cli_version: z
    .string()
    .min(1)
    .max(32)
    .regex(/^[0-9A-Za-z.\-+]+$/),
  agent_category: z.enum(TELEMETRY_CATEGORIES).optional(),
  used_pro_mode: z.boolean().optional(),
  used_swarm: z.boolean().optional(),
  used_voice: z.boolean().optional(),
  safety_score: z.number().int().min(0).max(100).optional(),
  agent_count: z.number().int().min(0).max(256).optional(),
  success: z.boolean().optional(),
  anon_install_id: z
    .string()
    .min(8)
    .max(64)
    .regex(/^[A-Za-z0-9_-]+$/, 'anon_install_id must be URL-safe'),
});

export type TelemetryPayload = z.infer<typeof telemetryPayloadSchema>;

export interface StoredTelemetryEvent extends TelemetryPayload {
  received_at: string;
}
