'use client';

import { NeonButton } from '@/components/ui/NeonButton';
import { trackInstall } from '@/lib/tracking';
import { cn } from '@/lib/utils';
import { Check, Copy, ExternalLink } from 'lucide-react';
import { useState } from 'react';

type CopyState = 'idle' | 'copied';

export function InstallOnX({
  agentId,
  repo,
  agentName,
  className,
}: {
  agentId: string;
  repo: string;
  agentName: string;
  className?: string;
}) {
  const [copyState, setCopyState] = useState<CopyState>('idle');
  const [bumping, setBumping] = useState(false);

  const agentUrl = `https://github.com/${repo}/tree/main/agents/${agentId}`;
  const tweetText = `Install this agent → ${agentUrl} @grok`;
  const intentUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(tweetText);
      setCopyState('copied');
      setBumping(true);
      setTimeout(() => setBumping(false), 450);
      setTimeout(() => setCopyState('idle'), 1600);
    } catch {
      setCopyState('idle');
    }
    void trackInstall(agentId, 'copy');
  }

  function onTweet() {
    void trackInstall(agentId, 'x-intent');
    window.open(intentUrl, '_blank', 'noopener,noreferrer');
    setBumping(true);
    setTimeout(() => setBumping(false), 450);
  }

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <NeonButton
          variant="secondary"
          size="lg"
          onClick={onCopy}
          leadingIcon={
            copyState === 'copied' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />
          }
          fullWidth
          aria-label={copyState === 'copied' ? 'Copied tweet text' : 'Copy tweet text'}
        >
          {copyState === 'copied' ? 'Copied' : 'Copy'}
        </NeonButton>
        <NeonButton
          variant="primary"
          size="lg"
          onClick={onTweet}
          leadingIcon={<XGlyph />}
          trailingIcon={<ExternalLink className="h-3.5 w-3.5" />}
          fullWidth
          aria-label={`Install ${agentName} on X`}
          className={cn(
            'relative overflow-hidden transition-shadow hover:shadow-greenGlow',
            bumping && 'animate-[install-pop_450ms_ease]'
          )}
        >
          Install on X
        </NeonButton>
      </div>
      <p className="text-[11px] text-ink-subtle leading-relaxed">
        Tapping <span className="text-cyan">Install on X</span> opens a pre-filled post tagging
        <span className="text-cyan"> @grok</span> with the agent link. Share it to install.
      </p>
      <style>{`
        @keyframes install-pop {
          0%   { transform: translateY(0) scale(1); }
          40%  { transform: translateY(-2px) scale(1.02); }
          100% { transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

function XGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="currentColor"
      aria-hidden
      className="shrink-0"
    >
      <path d="M18.244 2H21.5l-7.52 8.59L22.78 22h-6.82l-5.34-6.98L4.4 22H1.144l8.04-9.19L1.22 2h6.98l4.83 6.38L18.244 2Zm-1.2 18h1.86L7.02 4H5.04l12.004 16Z" />
    </svg>
  );
}
