import { CircuitTrace } from '@/components/ui/CircuitTrace';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { Section, SectionHeader } from '@/components/ui/Section';
import { CheckCircle2, Github, Shield, XCircle } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy',
  description:
    'How GrokInstall collects telemetry, what it never stores, how to opt out, and the 90-day retention policy.',
};

export default function PrivacyPage() {
  return (
    <div className="flex flex-col gap-10 pb-16">
      <section className="relative overflow-hidden border-b border-border-subtle">
        <CircuitTrace density="sparse" />
        <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-14 pb-10">
          <SectionHeader
            eyebrow="Privacy"
            title="Transparent by default."
            description="We treat telemetry the way we'd want our own tooling to treat it: aggregated, anonymous, and revocable. Every byte that leaves your machine is listed below."
          />
        </div>
      </section>

      <Section>
        <div className="flex flex-col gap-8 max-w-3xl">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <GlassCard padding="lg" className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-green">
                <CheckCircle2 className="h-5 w-5" />
                <p className="font-display text-lg tracking-tight text-ink">What we collect</p>
              </div>
              <ul className="flex flex-col gap-2 text-sm text-ink-muted leading-relaxed">
                <li>
                  Event name: <code className="font-mono text-cyan">deploy</code>,{' '}
                  <code className="font-mono text-cyan">post</code>,{' '}
                  <code className="font-mono text-cyan">call</code>,{' '}
                  <code className="font-mono text-cyan">scan</code>,{' '}
                  <code className="font-mono text-cyan">error</code>
                </li>
                <li>
                  CLI version (e.g. <code className="font-mono text-cyan">2.0.4</code>)
                </li>
                <li>
                  Agent category (<code className="font-mono text-cyan">voice</code>,{' '}
                  <code className="font-mono text-cyan">swarm</code>, …)
                </li>
                <li>Boolean flags for Pro Mode, Voice-Ready, Swarm-Ready usage</li>
                <li>Safety score bucket and success boolean</li>
                <li>
                  A random, locally-generated{' '}
                  <code className="font-mono text-cyan">anon_install_id</code> (rotates on{' '}
                  <code className="font-mono text-cyan">grok-install reset</code>)
                </li>
                <li>Server-side receive time (for rate limiting + retention)</li>
              </ul>
            </GlassCard>

            <GlassCard padding="lg" className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-danger">
                <XCircle className="h-5 w-5" />
                <p className="font-display text-lg tracking-tight text-ink">
                  What we never collect
                </p>
              </div>
              <ul className="flex flex-col gap-2 text-sm text-ink-muted leading-relaxed">
                <li>IP addresses (stripped at the edge)</li>
                <li>OS usernames, hostnames, or file paths</li>
                <li>Agent YAML contents</li>
                <li>Prompts, completions, or any response bodies</li>
                <li>API keys, tokens, or secrets</li>
                <li>Email addresses or X handles</li>
                <li>Timestamps below 1-second resolution</li>
              </ul>
            </GlassCard>
          </div>

          <GlassCard padding="lg" className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-cyan" />
              <p className="font-display text-lg tracking-tight text-ink">How to opt out</p>
            </div>
            <ol className="flex flex-col gap-2 text-sm text-ink-muted leading-relaxed list-decimal list-inside">
              <li>
                Run every CLI command with{' '}
                <code className="font-mono text-cyan">--no-telemetry</code>.
              </li>
              <li>
                Or set <code className="font-mono text-cyan">GROKINSTALL_TELEMETRY=0</code> in your
                shell profile.
              </li>
              <li>
                Or delete{' '}
                <code className="font-mono text-cyan">~/.config/grok-install/anon_id</code> and
                re-run <code className="font-mono text-cyan">grok-install reset --telemetry</code>.
              </li>
              <li>
                Previously-sent events remain in the aggregate counters (they're already anonymised)
                but no new events are recorded.
              </li>
            </ol>
          </GlassCard>

          <GlassCard padding="lg" className="flex flex-col gap-3">
            <p className="font-display text-lg tracking-tight text-ink">Browser analytics events</p>
            <p className="text-sm text-ink-muted leading-relaxed">
              Plausible records cookieless page views plus a short list of custom events so we can
              see which surfaces people actually use. Each event name and every property value is
              bounded — no free-text, no PII. You can block all of these with any tracking blocker;
              the site works identically without them.
            </p>
            <ul className="flex flex-col gap-2 text-sm text-ink-muted leading-relaxed">
              <li>
                <code className="font-mono text-cyan">agent_viewed</code> — properties:{' '}
                <code className="font-mono text-cyan">agent</code>
              </li>
              <li>
                <code className="font-mono text-cyan">install_clicked</code> — properties:{' '}
                <code className="font-mono text-cyan">agent</code>,{' '}
                <code className="font-mono text-cyan">source</code>
              </li>
              <li>
                <code className="font-mono text-cyan">search_used</code> — properties:{' '}
                <code className="font-mono text-cyan">q</code> (lowercased, truncated to 40 chars)
              </li>
              <li>
                <code className="font-mono text-cyan">filter_applied</code> — properties:{' '}
                <code className="font-mono text-cyan">kind</code>,{' '}
                <code className="font-mono text-cyan">value</code>
              </li>
              <li>
                <code className="font-mono text-cyan">visuals_block_rendered</code>{' '}
                <span className="text-ink-subtle">(v2.14)</span> — properties:{' '}
                <code className="font-mono text-cyan">agent_id</code>,{' '}
                <code className="font-mono text-cyan">accent_color</code> (one of{' '}
                <code className="font-mono text-cyan">cyan</code> /{' '}
                <code className="font-mono text-cyan">green</code>),{' '}
                <code className="font-mono text-cyan">style</code> (one of{' '}
                <code className="font-mono text-cyan">futuristic</code> /{' '}
                <code className="font-mono text-cyan">premium</code> /{' '}
                <code className="font-mono text-cyan">minimal</code>). Fires once per preview card
                mount so we can see which visual presets perform best.
              </li>
            </ul>
          </GlassCard>

          <GlassCard padding="lg" className="flex flex-col gap-3">
            <p className="font-display text-lg tracking-tight text-ink">Retention</p>
            <ul className="flex flex-col gap-2 text-sm text-ink-muted leading-relaxed">
              <li>
                <span className="text-ink">Individual events</span>: purged after{' '}
                <span className="text-cyan">90 days</span>. A nightly job runs{' '}
                <code className="font-mono text-cyan">
                  DELETE FROM telemetry_events WHERE received_at &lt; NOW() - INTERVAL '90 days'
                </code>
                .
              </li>
              <li>
                <span className="text-ink">Aggregated counters</span>: retained indefinitely. These
                are non-reversible sums (total installs, posts generated, API calls saved) — no
                row-level data remains.
              </li>
              <li>Back-ups are end-to-end encrypted and follow the same 90-day window.</li>
            </ul>
          </GlassCard>

          <GlassCard padding="lg" className="flex flex-col gap-3">
            <p className="font-display text-lg tracking-tight text-ink">Read the source</p>
            <p className="text-sm text-ink-muted">
              Every line of the telemetry pipeline — from the CLI emitter to the receive endpoint to
              the retention job — is open-source. Audit it, submit a PR, or build your own fork.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <NeonButton
                variant="secondary"
                size="sm"
                href="https://github.com/AgentMindCloud/grok-install-cli/tree/main/src/telemetry"
                external
                leadingIcon={<Github className="h-4 w-4" />}
              >
                CLI telemetry module
              </NeonButton>
              <NeonButton
                variant="secondary"
                size="sm"
                href="https://github.com/AgentMindCloud/grok-agents-marketplace/tree/main/src/app/api/telemetry"
                external
                leadingIcon={<Github className="h-4 w-4" />}
              >
                Server endpoint
              </NeonButton>
              <NeonButton
                variant="secondary"
                size="sm"
                href="https://github.com/AgentMindCloud/grok-agents-marketplace/blob/main/src/lib/telemetry-queries.ts"
                external
                leadingIcon={<Github className="h-4 w-4" />}
              >
                Aggregation queries
              </NeonButton>
            </div>
          </GlassCard>

          <p className="text-[11px] text-ink-subtle">
            Questions or concerns?{' '}
            <Link
              href="https://github.com/AgentMindCloud/grok-agents-marketplace/issues/new"
              className="text-cyan hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open an issue
            </Link>{' '}
            and we'll respond on the public thread.
          </p>
        </div>
      </Section>
    </div>
  );
}
