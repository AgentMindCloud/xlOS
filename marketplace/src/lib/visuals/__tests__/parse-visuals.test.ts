// src/lib/visuals/__tests__/parse-visuals.test.ts
import { describe, expect, it } from 'vitest';
import { AgentVisualsSchema, parseVisuals } from '../parse-visuals';

describe('parseVisuals', () => {
  it('accepts futuristic + cyan + gif media with url', () => {
    const input = {
      style: 'futuristic',
      accent_color: 'cyan',
      demo_media: { kind: 'gif', url: 'https://example.com/demo.gif' },
    };
    const parsed = parseVisuals(input);
    expect(parsed).not.toBeNull();
    expect(parsed?.style).toBe('futuristic');
    expect(parsed?.accent_color).toBe('cyan');
    expect(parsed?.demo_media.kind).toBe('gif');
  });

  it('accepts premium + green + video media with poster', () => {
    const input = {
      style: 'premium',
      accent_color: 'green',
      demo_media: {
        kind: 'video',
        url: 'https://example.com/demo.mp4',
        poster: 'https://example.com/poster.png',
      },
    };
    const parsed = parseVisuals(input);
    expect(parsed).not.toBeNull();
    expect(parsed?.demo_media.kind).toBe('video');
  });

  it('accepts minimal + cyan + image media', () => {
    const input = {
      style: 'minimal',
      accent_color: 'cyan',
      demo_media: { kind: 'image', url: 'https://example.com/hero.png' },
    };
    expect(parseVisuals(input)).not.toBeNull();
  });

  it('accepts auto_generate media without a url', () => {
    const input = {
      style: 'futuristic',
      accent_color: 'green',
      demo_media: { kind: 'auto_generate' },
    };
    const parsed = parseVisuals(input);
    expect(parsed).not.toBeNull();
    expect(parsed?.demo_media.kind).toBe('auto_generate');
  });

  it('rejects hex values for accent_color (token names only)', () => {
    const input = {
      style: 'futuristic',
      accent_color: '#00F0FF',
      demo_media: { kind: 'auto_generate' },
    };
    expect(parseVisuals(input)).toBeNull();
  });

  it('rejects unknown accent_color values', () => {
    const input = {
      style: 'futuristic',
      accent_color: 'red',
      demo_media: { kind: 'auto_generate' },
    };
    expect(parseVisuals(input)).toBeNull();
  });

  it('rejects gif media missing the url field', () => {
    const input = {
      style: 'futuristic',
      accent_color: 'cyan',
      demo_media: { kind: 'gif' },
    };
    expect(parseVisuals(input)).toBeNull();
  });

  it('rejects video media with a non-URL string', () => {
    const input = {
      style: 'premium',
      accent_color: 'green',
      demo_media: { kind: 'video', url: 'not-a-url' },
    };
    expect(parseVisuals(input)).toBeNull();
  });

  it('strips unknown top-level fields without failing', () => {
    const input = {
      style: 'minimal',
      accent_color: 'cyan',
      demo_media: { kind: 'auto_generate' },
      extra: 'ignored',
    };
    const parsed = parseVisuals(input);
    expect(parsed).not.toBeNull();
    expect(parsed as Record<string, unknown>).not.toHaveProperty('extra');
  });

  it('returns null for null input', () => {
    expect(parseVisuals(null)).toBeNull();
  });

  it('returns null for undefined input', () => {
    expect(parseVisuals(undefined)).toBeNull();
  });

  it('rejects unknown style values', () => {
    const input = {
      style: 'invalid',
      accent_color: 'cyan',
      demo_media: { kind: 'auto_generate' },
    };
    expect(parseVisuals(input)).toBeNull();
  });

  it('accepts optional headline and subheadline', () => {
    const input = {
      style: 'premium',
      accent_color: 'green',
      demo_media: { kind: 'auto_generate' },
      headline: 'Ship Grok-native agents in one click.',
      subheadline: 'One YAML, one tweet, zero glue code.',
    };
    const parsed = parseVisuals(input);
    expect(parsed?.headline).toBe('Ship Grok-native agents in one click.');
    expect(parsed?.subheadline).toBe('One YAML, one tweet, zero glue code.');
  });

  it('rejects overly long headlines', () => {
    const input = {
      style: 'minimal',
      accent_color: 'cyan',
      demo_media: { kind: 'auto_generate' },
      headline: 'x'.repeat(121),
    };
    expect(parseVisuals(input)).toBeNull();
  });

  it('accepts plasma accent (Spectral Tier 4)', () => {
    const input = {
      style: 'futuristic',
      accent_color: 'plasma',
      demo_media: { kind: 'auto_generate' },
    };
    const parsed = parseVisuals(input);
    expect(parsed).not.toBeNull();
    expect(parsed?.accent_color).toBe('plasma');
  });

  it('accepts aurora accent (Spectral Tier 4)', () => {
    const input = {
      style: 'premium',
      accent_color: 'aurora',
      demo_media: { kind: 'auto_generate' },
    };
    const parsed = parseVisuals(input);
    expect(parsed).not.toBeNull();
    expect(parsed?.accent_color).toBe('aurora');
  });

  it('exports a Zod schema directly usable via safeParse', () => {
    const result = AgentVisualsSchema.safeParse({
      style: 'futuristic',
      accent_color: 'cyan',
      demo_media: { kind: 'auto_generate' },
    });
    expect(result.success).toBe(true);
  });
});
