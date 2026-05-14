import { AccentButton } from '@/components/ui/AccentButton';
import { CircuitTrace } from '@/components/ui/CircuitTrace';
import { NebulaBackdrop } from '@/components/ui/NebulaBackdrop';
import { StatPill } from '@/components/ui/StatPill';
import { SITE_TAGLINE } from '@/lib/constants';
import { ArrowRight, Github, Zap } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border-subtle">
      <NebulaBackdrop intensity="rich" />
      <CircuitTrace className="opacity-30 mix-blend-screen" density="sparse" />
      <div className="relative mx-auto flex w-full max-w-7xl flex-col items-start gap-8 px-4 pb-24 pt-20 sm:px-6 lg:px-8 lg:pt-28 lg:pb-32">
        <span className="glass-card cinnabar-border-glow inline-flex items-center gap-2 rounded-sm px-3 py-1 font-mono text-xs uppercase tracking-[0.2em] text-cinnabar-300">
          <Zap className="h-3.5 w-3.5" /> {SITE_TAGLINE}
        </span>

        <h1 className="max-w-4xl font-display text-4xl font-semibold leading-[0.95] tracking-tightest text-ink-900 sm:text-5xl md:text-6xl lg:text-7xl">
          The community marketplace for <span className="cinnabar-text">Grok-native</span> agents on
          X.
        </h1>

        <p className="max-w-2xl text-base text-ink-700 sm:text-lg">
          Discover agents certified Grok-Native, Safety-Max, Voice-Ready, and Swarm-Ready. Install
          in one click, inspect the YAML, and ship in minutes.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <AccentButton
            variant="primary"
            size="lg"
            href="/marketplace"
            trailingIcon={<ArrowRight className="h-4 w-4" />}
            className="cinnabar-gradient shadow-cinnabar-glow"
          >
            Browse Agents
          </AccentButton>
          <AccentButton
            variant="secondary"
            size="lg"
            href="https://github.com/AgentMindCloud/awesome-grok-agents"
            external
            leadingIcon={<Github className="h-4 w-4" />}
            className="glass-card glass-hover"
          >
            Submit your agent
          </AccentButton>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <span className="glass-card cinnabar-border-glow inline-flex items-center rounded-sm">
            <StatPill value="14" label="YAML standards" tone="plasma" />
          </span>
          <span className="glass-card cinnabar-border-glow inline-flex items-center rounded-sm">
            <StatPill value="6" label="Certifications" tone="aurora" />
          </span>
          <span className="glass-card cinnabar-border-glow inline-flex items-center rounded-sm">
            <StatPill value="One-click" label="Install on X" tone="plasma" />
          </span>
        </div>
      </div>
      <div className="plate-divider" />
    </section>
  );
}
