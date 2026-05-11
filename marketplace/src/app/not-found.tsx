import { CircuitTrace } from '@/components/ui/CircuitTrace';
import { NeonButton } from '@/components/ui/NeonButton';
import { Compass, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <section className="relative flex min-h-[70vh] items-center overflow-hidden">
      <CircuitTrace density="sparse" />
      <div className="relative mx-auto flex w-full max-w-3xl flex-col items-start gap-6 px-4 py-20 sm:px-6 lg:px-8">
        <span className="rounded-sm border border-cyan/40 bg-cyan/5 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] font-mono text-cyan">
          404 · Signal lost
        </span>
        <h1 className="font-display text-4xl tracking-tightest text-ink sm:text-5xl">
          We couldn’t route you there.
        </h1>
        <p className="max-w-lg text-ink-muted">
          That agent isn’t on the grid. Jump back to the marketplace — or head home and we’ll point
          you at something new.
        </p>
        <div className="flex flex-wrap gap-3">
          <NeonButton
            variant="primary"
            size="md"
            href="/"
            leadingIcon={<Home className="h-4 w-4" />}
          >
            Home
          </NeonButton>
          <NeonButton
            variant="secondary"
            size="md"
            href="/marketplace"
            leadingIcon={<Compass className="h-4 w-4" />}
          >
            Browse agents
          </NeonButton>
        </div>
      </div>
    </section>
  );
}
