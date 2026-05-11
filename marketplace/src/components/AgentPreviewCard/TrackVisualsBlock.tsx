// src/components/AgentPreviewCard/TrackVisualsBlock.tsx
'use client';

import { trackVisualsBlockRendered } from '@/lib/tracking';
import type { VisualAccent, VisualStyle } from '@/lib/visuals/parse-visuals';
import { useEffect } from 'react';

interface TrackVisualsBlockProps {
  agentId: string;
  accentColor: VisualAccent;
  style: VisualStyle;
}

export function TrackVisualsBlock({ agentId, accentColor, style }: TrackVisualsBlockProps) {
  useEffect(() => {
    trackVisualsBlockRendered(agentId, accentColor, style);
  }, [agentId, accentColor, style]);
  return null;
}
