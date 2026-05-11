// src/lib/visuals/parse-visuals.ts
import { z } from 'zod';

export const VisualAccentSchema = z.enum(['plasma', 'aurora', 'cyan', 'green']);
export const VisualStyleSchema = z.enum(['futuristic', 'premium', 'minimal']);

const urlField = z.string().url().max(2048);
const posterField = urlField.optional();

export const AgentDemoMediaSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('gif'), url: urlField, poster: posterField }),
  z.object({ kind: z.literal('video'), url: urlField, poster: posterField }),
  z.object({ kind: z.literal('image'), url: urlField, poster: posterField }),
  z.object({ kind: z.literal('auto_generate') }),
]);

export const AgentVisualsSchema = z.object({
  style: VisualStyleSchema,
  accent_color: VisualAccentSchema,
  demo_media: AgentDemoMediaSchema,
  headline: z.string().min(1).max(120).optional(),
  subheadline: z.string().min(1).max(240).optional(),
});

export type VisualAccent = z.infer<typeof VisualAccentSchema>;
export type VisualStyle = z.infer<typeof VisualStyleSchema>;
export type AgentDemoMedia = z.infer<typeof AgentDemoMediaSchema>;
export type AgentVisuals = z.infer<typeof AgentVisualsSchema>;

export function parseVisuals(input: unknown): AgentVisuals | null {
  if (input === null || input === undefined) return null;
  const result = AgentVisualsSchema.safeParse(input);
  return result.success ? result.data : null;
}
