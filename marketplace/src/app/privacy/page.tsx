import { CircuitTrace } from '@/components/ui/CircuitTrace';
import { GlassCard } from '@/components/ui/GlassCard';
import { AccentButton } from '@/components/ui/AccentButton';
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
      <section className="relative overflow-hidden border-b border-ink-300/40">
        <CircuitTrace density="sparse" />
        <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-14 pb-10">
          <SectionHeader
            eyebrow="Privacy"
            tone="cinnabar"
            title="Transparent by default."
            description="We treat telemetry the way we'd want our own tooling to treat it: aggregated, anonymous, and revocable. Every byte that leaves your machine is listed below."
          />
        </div>
      </section>

      <Section>
        <div className="flex flex-col gap-8 max-w-3xl">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <GlassCard padding="lg" className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-success">
                <CheckCircle2 className="h-5 w-5" />
                <p className="font-display text-lg font-semibold tracking-tight text-ink-900">What we collect</p>
              </div>
              <ul className="flex flex-col gap-2 text-sm text-ink-700 leading-relaxed">
                <li>
                  Event name: <code className="font-mono text-cinnabar-400">deploy</code>,{' '}
                  <code className="font-mono text-cinnabar-400">post</code>,{' '}
                  <code className="font-mono text-cinnabar-400">call</code>,{' '}
                  <code className="font-mono text-cinnabar-400">scan</code>,{' '}
                  <code className="font-mono text-cinnabar-400">error</code>
                </li>
                <li>
                  CLI version (e.g. <code className="font-mono text-cinnabar-400">2.0.4</code>)
                </li>
                <li>
                  Agent category (<code className="font-mono text-cinnabar-400">voice</code>,{' '}
                  <code className="font-mono text-cinnabar-400">swarm</code>, …)
                </li>
                <li>Boolean flags for Pro Mode, Voice-Ready, Swarm-Ready usage</li>
                <li>Safety score bucket and success boolean</li>
                <li>
                  A random, locally-generated{' '}
                  <code className="font-mono text-cinnabar-400">anon_install_id</code> (rotates on{' '}
                  <code className="font-mono text-cinnabar-400">grok-install reset</code>)
                </li>
                <li>Server-side receive time (for rate limiting + retention)</li>
              </ul>
            </GlassCard>

            <GlassCard padding="lg" className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-danger">
                <XCircle className="h-5 w-5" />
                <p className="font-display text-lg font-semibold tracking-tight text-ink-900">
                  What we never collect
                </p>
              </div>
              <ul className="flex flex-col gap-2 text-sm text-ink-700 leading-relaxed">
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
              <Shield className="h-5 w-5 text-cinnabar-400" />
              <p className="font-display text-lg font-semibold tracking-tight text-ink-900">How to opt out</p>
            </div>
            <ol className="flex flex-col gap-2 text-sm text-ink-700 leading-relaxed list-decimal list-inside">
              <li>
                Run every CLI command with{' '}
                <code className="font-mono text-cinnabar-400">--no-telemetry</code>.
              </li>
              <li>
                Or set <code className="font-mono text-cinnabar-400">GROKINSTALL_TELEMETRY=0</code> in your
                shell profile.
              </li>
              <li>
                Or delete{' '}
                <code className="font-mono text-cinnabar-400">~/.config/grok-install/anon_id</code> and
                re-run <code className="font-mono text-cinnabar-400">grok-install reset --telemetry</code>.
              </li>
              <li>
                Previously-sent events remain in the aggregate counters (they're already anonymised)
                but no new events are recorded.
              </li>
            </ol>
          </GlassCard>

          <GlassCard padding="lg" className="flex flex-col gap-3">
            <p className="font-display text-lg font-semibold tracking-tight text-ink-900">Browser analytics events</p>
            <p className="text-sm text-ink-700 leading-relaxed">
              Plausible records cookieless page views plus a short list of custom events so we can
              see which surfaces people actually use. Each event name and every property value is
              bounded — no free-text, no PII. You can block all of these with any tracking blocker;
              the site works identically without them.
            </p>
            <ul className="flex flex-col gap-2 text-sm text-ink-700 leading-relaxed">
              <li>
                <code className="font-mono text-cinnabar-400">agent_viewed</code> — properties:{' '}
                <code className="font-mono text-cinnabar-400">agent</code>
              </li>
              <li>
                <code className="font-mono text-cinnabar-400">install_clicked</code> — properties:{' '}
                <code className="font-mono text-cinnabar-400">agent</code>,{' '}
                <code className="font-mono text-cinnabar-400">source</code>
              </li>
              <li>
                <code className="font-mono text-cinnabar-400">search_used</code> — properties:{' '}
                <code className="font-mono text-cinnabar-400">q</code> (lowercased, truncated to 40 chars)
              </li>
              <li>
                <code className="font-mono text-cinnabar-400">filter_applied</code> — properties:{' '}
                <code className="font-mono text-cinnabar-400">kind</code>,{' '}
                <code className="font-mono text-cinnabar-400">value</code>
              </li>
              <li>
                <code className="font-mono text-cinnabar-400">visuals_block_rendered</code>{' '}
                <span className="text-ink-600">(v2.14)</span> — properties:{' '}
                <code className="font-mono text-cinnabar-400">agent_id</code>,{' '}
                <code className="font-mono text-cinnabar-400">accent_color</code> (one of{' '}
                <code className="font-mono text-cinnabar-400">cyan</code> /{' '}
                <code className="font-mono text-cinnabar-400">green</code>),{' '}
                <code className="font-mono text-cinnabar-400">style</code> (one of{' '}
                <code className="font-mono text-cinnabar-400">futuristic</code> /{' '}
                <code className="font-mono text-cinnabar-400">premium</code> /{' '}
                <code className="font-mono text-cinnabar-400">minimal</code>). Fires once per preview card
                mount so we can see which visual presets perform best.
              </li>
            </ul>
          </GlassCard>

          <GlassCard padding="lg" className="flex flex-col gap-3">
            <p className="font-display text-lg font-semibold tracking-tight text-ink-900">Retention</p>
            <ul className="flex flex-col gap-2 text-sm text-ink-700 leading-relaxed">
              <li>
                <span className="text-ink-900">Individual events</span>: purged after{' '}
                <span className="text-cinnabar-400">90 days</span>. A nightly job runs{' '}
                <code className="font-mono text-cinnabar-400">
                  DELETE FROM telemetry_events WHERE received_at &lt; NOW() - INTERVAL '90 days'
                </code>
                .
              </li>
              <li>
                <span className="text-ink-900">Aggregated counters</span>: retained indefinitely. These
                are non-reversible sums (total installs, posts generated, API calls saved) — no
                row-level data remains.
              </li>
              <li>Back-ups are end-to-end encrypted and follow the same 90-day window.</li>
            </ul>
          </GlassCard>

          <GlassCard padding="lg" className="flex flex-col gap-3">
            <p className="font-display text-lg font-semibold tracking-tight text-ink-900">Read the source</p>
            <p className="text-sm text-ink-700">
              Every line of the telemetry pipeline — from the CLI emitter to the receive endpoint to
              the retention job — is open-source. Audit it, submit a PR, or build your own fork.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <AccentButton
                variant="secondary"
                size="sm"
                href="https://github.com/AgentMindCloud/grok-install-cli/tree/main/src/telemetry"
                external
                leadingIcon={<Github className="h-4 w-4" />}
              >
                CLI telemetry module
              </AccentButton>
              <AccentButton
                variant="secondary"
                size="sm"
                href="https://github.com/AgentMindCloud/grok-agents-marketplace/tree/main/src/app/api/telemetry"
                external
                leadingIcon={<Github className="h-4 w-4" />}
              >
                Server endpoint
              </AccentButton>
              <AccentButton
                variant="secondary"
                size="sm"
                href="https://github.com/AgentMindCloud/grok-agents-marketplace/blob/main/src/lib/telemetry-queries.ts"
                external
                leadingIcon={<Github className="h-4 w-4" />}
              >
                Aggregation queries
              </AccentButton>
            </div>
          </GlassCard>

          <p className="text-[11px] text-ink-600">
            Questions or concerns?{' '}
            <Link
              href="https://github.com/AgentMindCloud/grok-agents-marketplace/issues/new"
              className="text-cinnabar-400 hover:underline"
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
