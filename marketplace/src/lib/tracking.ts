'use client';

import type { InstallSource } from './installs';
import type { VisualAccent, VisualStyle } from './visuals/parse-visuals';

type PlausibleProps = Record<string, string | number | boolean>;

export function plausible(event: string, props?: PlausibleProps): void {
  if (typeof window === 'undefined') return;
  window.plausible?.(event, props ? { props } : undefined);
}

export function trackVisualsBlockRendered(
  agentId: string,
  accentColor: VisualAccent,
  style: VisualStyle
): void {
  plausible('visuals_block_rendered', {
    agent_id: agentId,
    accent_color: accentColor,
    style,
  });
}

export async function trackInstall(agentId: string, source: InstallSource): Promise<void> {
  plausible('install_clicked', { agent: agentId, source });
  const endpoint = source === 'x-intent' ? '/api/track-install-intent' : '/api/track-install';
  try {
    await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ agent_id: agentId, source }),
      keepalive: true,
    });
  } catch {
    /* fire-and-forget */
  }
}

export function trackAgentView(agentId: string): void {
  plausible('agent_viewed', { agent: agentId });
}

export function trackSearch(query: string): void {
  const trimmed = query.trim().toLowerCase().slice(0, 40);
  if (!trimmed) return;
  plausible('search_used', { q: trimmed });
}

export function trackFilter(kind: 'category' | 'certification' | 'sort', value: string): void {
  plausible('filter_applied', { kind, value });
}
