'use client';

import { NeonButton } from '@/components/ui/NeonButton';
import { Check, Share2 } from 'lucide-react';
import { useState } from 'react';

export function SnapshotButton({ siteUrl }: { siteUrl: string }) {
  const [state, setState] = useState<'idle' | 'copied'>('idle');
  async function share() {
    const url = `${siteUrl.replace(/\/$/, '')}/stats/snapshot/opengraph-image?t=${Date.now()}`;
    try {
      await navigator.clipboard.writeText(url);
      setState('copied');
      setTimeout(() => setState('idle'), 1800);
    } catch {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }
  return (
    <NeonButton
      variant="primary"
      size="sm"
      onClick={share}
      leadingIcon={
        state === 'copied' ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />
      }
    >
      {state === 'copied' ? 'Snapshot link copied' : 'Shareable snapshot'}
    </NeonButton>
  );
}
