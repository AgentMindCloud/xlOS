import { GlassCard } from '@/components/ui/GlassCard';
import type { AgentCreator } from '@/lib/types';
import { Bot, Github } from 'lucide-react';
import Image from 'next/image';

export function CreatorProfile({ creator }: { creator: AgentCreator }) {
  return (
    <GlassCard padding="md" className="flex items-start gap-3">
      {creator.avatar ? (
        <Image
          src={creator.avatar}
          alt=""
          width={44}
          height={44}
          className="h-11 w-11 rounded-sm border border-ink-300 shrink-0"
          unoptimized
        />
      ) : (
        <div className="h-11 w-11 rounded-sm border border-ink-300 bg-ink-100 shrink-0" />
      )}
      <div className="flex min-w-0 flex-col gap-1">
        <p className="font-display text-base font-semibold tracking-tight text-ink-900 truncate">
          {creator.handle}
        </p>
        <div className="flex items-center gap-3 font-mono text-xs text-ink-600">
          {typeof creator.agentCount === 'number' ? (
            <span className="inline-flex items-center gap-1">
              <Bot className="h-3 w-3" /> {creator.agentCount} agents
            </span>
          ) : null}
          {creator.github ? (
            <a
              href={`https://github.com/${creator.github}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-cinnabar-400 transition-colors"
            >
              <Github className="h-3 w-3" /> @{creator.github}
            </a>
          ) : null}
        </div>
      </div>
    </GlassCard>
  );
}
