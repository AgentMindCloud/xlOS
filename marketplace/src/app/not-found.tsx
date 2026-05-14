import { AccentButton } from '@/components/ui/AccentButton';
import { CircuitTrace } from '@/components/ui/CircuitTrace';
import { GlassCard } from '@/components/ui/GlassCard';
import { Compass, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <section className="relative flex min-h-[70vh] items-center overflow-hidden">
      <div className="absolute inset-0 bg-nebula" aria-hidden />
      <CircuitTrace density="sparse" className="opacity-40" />
      <div className="relative mx-auto w-full max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
        <GlassCard
          elevation="lifted"
          padding="lg"
          className="flex flex-col items-start gap-6 cinnabar-gradient-soft"
        >
          <span className="rounded-sm border border-cinnabar-500/40 cinnabar-gradient-soft px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.22em] text-cinnabar-300">
            404 · Signal lost
          </span>
          <h1 className="font-display text-5xl sm:text-6xl font-semibold tracking-tight">
            <span className="cinnabar-text">We couldn&apos;t route you there.</span>
          </h1>
          <p className="max-w-lg text-ink-700 leading-relaxed">
            That agent isn&apos;t on the grid. Jump back to the marketplace — or head home and
            we&apos;ll point you at something new.
          </p>
          <div className="flex flex-wrap gap-3">
            <AccentButton
              variant="primary"
              size="md"
              href="/"
              leadingIcon={<Home className="h-4 w-4" />}
            >
              Home
            </AccentButton>
            <AccentButton
              variant="secondary"
              size="md"
              href="/marketplace"
              leadingIcon={<Compass className="h-4 w-4" />}
            >
              Browse agents
            </AccentButton>
          </div>
        </GlassCard>
      </div>
    </section>
  );
}
