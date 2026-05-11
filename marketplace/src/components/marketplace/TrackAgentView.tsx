'use client';

import { trackAgentView } from '@/lib/tracking';
import { useEffect } from 'react';

export function TrackAgentView({ agentId }: { agentId: string }) {
  useEffect(() => {
    trackAgentView(agentId);
  }, [agentId]);
  return null;
}
