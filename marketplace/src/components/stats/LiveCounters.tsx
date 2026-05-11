'use client';

import { GlassCard } from '@/components/ui/GlassCard';
import { formatCount } from '@/lib/utils';
import { Bot, FileText, MessageCircle, Zap } from 'lucide-react';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import useSWR from 'swr';

interface SummaryPayload {
  totals: {
    agentsInstalled: number;
    xPostsGenerated: number;
    apiCallsSaved: number;
    activeAgents7d: number;
  };
}

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error(`${r.status}`);
    return r.json() as Promise<SummaryPayload>;
  });

export function LiveCounters({ fallback }: { fallback: SummaryPayload['totals'] }) {
  const { data } = useSWR<SummaryPayload>('/api/stats/public', fetcher, {
    refreshInterval: 30_000,
    revalidateOnFocus: false,
    fallbackData: { totals: fallback },
  });
  const totals = data?.totals ?? fallback;

  const items: { icon: ReactNode; label: string; value: number; suffix?: string }[] = [
    {
      icon: <Bot className="h-4 w-4" />,
      label: 'Total agents installed',
      value: totals.agentsInstalled,
    },
    {
      icon: <MessageCircle className="h-4 w-4" />,
      label: 'X posts generated',
      value: totals.xPostsGenerated,
    },
    {
      icon: <Zap className="h-4 w-4" />,
      label: 'API calls saved',
      value: totals.apiCallsSaved,
    },
    {
      icon: <FileText className="h-4 w-4" />,
      label: 'Active agents · 7d',
      value: totals.activeAgents7d,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
      {items.map((i) => (
        <GlassCard key={i.label} padding="md" className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-cyan">
            {i.icon}
            <span className="text-[11px] uppercase tracking-[0.18em] font-mono">{i.label}</span>
          </div>
          <AnimatedCount target={i.value} />
        </GlassCard>
      ))}
    </div>
  );
}

function AnimatedCount({ target }: { target: number }) {
  const [display, setDisplay] = useState(target);
  const rafRef = useRef<number | null>(null);
  const fromRef = useRef<number>(0);
  const startedRef = useRef<boolean>(false);

  useEffect(() => {
    const start = startedRef.current ? display : 0;
    fromRef.current = start;
    const duration = startedRef.current ? 500 : 1400;
    startedRef.current = true;
    const t0 = performance.now();

    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / duration);
      const eased = 1 - (1 - t) * (1 - t) * (1 - t); // easeOutCubic
      const next = Math.round(start + (target - start) * eased);
      setDisplay(next);
      if (t < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return (
    <div className="font-display text-2xl tracking-tight tabular-nums text-ink md:text-3xl">
      {formatCount(display)}
    </div>
  );
}
