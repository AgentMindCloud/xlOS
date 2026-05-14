import { AgentPreviewCard } from '@/components/AgentPreviewCard/AgentPreviewCard';
import { CreatorProfile } from '@/components/marketplace/CreatorProfile';
import { InstallOnX } from '@/components/marketplace/InstallOnX';
import { InstallTabs } from '@/components/marketplace/InstallTabs';
import { TrackAgentView } from '@/components/marketplace/TrackAgentView';
import { YamlSnippet } from '@/components/marketplace/YamlSnippet';
import { AccentButton } from '@/components/ui/AccentButton';
import { CertificationBadgeRow } from '@/components/ui/CertificationBadge';
import { CircuitTrace } from '@/components/ui/CircuitTrace';
import { GlassCard } from '@/components/ui/GlassCard';
import { Section } from '@/components/ui/Section';
import { StatPill } from '@/components/ui/StatPill';
import { getAgentById, getAgents } from '@/lib/agents';
import { CATEGORY_LABELS } from '@/lib/constants';
import { getStarCounts } from '@/lib/github';
import { formatCount, formatRelative } from '@/lib/utils';
import { ArrowLeft, Download, ExternalLink, Github, ShieldCheck, Star } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const revalidate = 600;

export async function generateStaticParams() {
  const agents = await getAgents();
  return agents.map((a) => ({ id: a.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const agent = await getAgentById(id);
  if (!agent) return { title: 'Agent not found' };
  return {
    title: agent.name,
    description: agent.tagline,
    openGraph: {
      title: `${agent.name} · GrokInstall`,
      description: agent.tagline,
      images: ['/og-default.svg'],
    },
  };
}

export default async function AgentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const agent = await getAgentById(id);
  if (!agent) notFound();

  const starsMap = await getStarCounts([agent.repo]);
  const stars = starsMap.get(agent.repo)?.stars ?? 0;

  return (
    <div className="flex flex-col gap-10 pb-16">
      <TrackAgentView agentId={agent.id} />
      <section className="relative overflow-hidden border-b border-ink-300/40">
        <div className="absolute inset-0 bg-nebula opacity-90" aria-hidden />
        <CircuitTrace density="sparse" className="opacity-50" />
        <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 pb-10">
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-1.5 font-mono text-xs text-ink-600 hover:text-cinnabar-400 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Marketplace
          </Link>

          <GlassCard
            elevation="lifted"
            padding="lg"
            className="relative mt-6 overflow-hidden cinnabar-gradient-soft"
          >
            <div className="flex flex-col gap-5">
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-cinnabar-400">
                {CATEGORY_LABELS[agent.category]}
              </span>
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-ink-900">
                <span className="cinnabar-text">{agent.name}</span>
              </h1>
              <p className="max-w-2xl text-base sm:text-lg leading-relaxed text-ink-700">
                {agent.tagline}
              </p>
              <CertificationBadgeRow slugs={agent.certifications} size="md" />
              <div className="flex flex-wrap items-center gap-1.5 pt-2">
                <StatPill
                  icon={<Star className="text-cinnabar-400" />}
                  value={formatCount(stars)}
                  label="stars"
                  tone="cinnabar"
                />
                <StatPill
                  icon={<Download />}
                  value={formatCount(agent.installs)}
                  label="installs"
                  tone="cinnabar"
                />
                {typeof agent.safetyScore === 'number' ? (
                  <StatPill
                    icon={<ShieldCheck />}
                    value={`${agent.safetyScore}/100`}
                    label="safety"
                    tone="neutral"
                  />
                ) : null}
                <StatPill value={`Updated ${formatRelative(agent.updated_at)}`} tone="neutral" />
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      <Section>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_340px]">
          <div className="flex flex-col gap-8">
            <GlassCard padding="lg">
              <h2 className="font-display text-xl font-semibold text-ink-900 mb-3">Overview</h2>
              <p className="text-ink-800 leading-relaxed">{agent.description}</p>
              {agent.tags.length ? (
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {agent.tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex rounded-sm border border-ink-300 bg-ink-100 px-2 py-0.5 text-[11px] font-mono text-ink-700"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              ) : null}
            </GlassCard>

            {agent.yaml ? (
              <div>
                <h2 className="font-display text-xl font-semibold text-ink-900 mb-3">Manifest</h2>
                <YamlSnippet
                  code={agent.yaml.content}
                  filename={agent.yaml.filename}
                  lang={agent.yaml.lang}
                />
              </div>
            ) : null}

            {agent.visuals ? (
              <div>
                <h2 className="font-display text-xl font-semibold text-ink-900 mb-3">Preview</h2>
                <AgentPreviewCard
                  agentId={agent.id}
                  agentName={agent.name}
                  visuals={agent.visuals}
                />
              </div>
            ) : agent.demo_url ? (
              <div>
                <h2 className="font-display text-xl font-semibold text-ink-900 mb-3">Demo</h2>
                <div className="aspect-video overflow-hidden rounded-md border border-ink-300 bg-ink-100">
                  <iframe
                    src={agent.demo_url}
                    title={`${agent.name} demo`}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            ) : null}

            <div>
              <h2 className="font-display text-xl font-semibold text-ink-900 mb-3">Install</h2>
              <InstallTabs agentId={agent.id} />
            </div>
          </div>

          <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
            <GlassCard elevation="lifted" padding="md" className="flex flex-col gap-4">
              <InstallOnX agentId={agent.id} repo={agent.repo} agentName={agent.name} />
              <div className="grid grid-cols-2 gap-2 pt-1">
                <AccentButton
                  variant="secondary"
                  size="sm"
                  href={`https://github.com/${agent.repo}`}
                  external
                  leadingIcon={<Github className="h-4 w-4" />}
                  fullWidth
                >
                  Repo
                </AccentButton>
                {agent.homepage ? (
                  <AccentButton
                    variant="ghost"
                    size="sm"
                    href={agent.homepage}
                    external
                    trailingIcon={<ExternalLink className="h-3.5 w-3.5" />}
                    fullWidth
                  >
                    Site
                  </AccentButton>
                ) : (
                  <AccentButton
                    variant="ghost"
                    size="sm"
                    href={`https://github.com/${agent.repo}/issues/new`}
                    external
                    fullWidth
                  >
                    Report
                  </AccentButton>
                )}
              </div>
              <Link
                href={`/stats/agents/${agent.id}` as never}
                className="text-center font-mono text-xs text-cinnabar-400 hover:text-cinnabar-300 hover:underline transition-colors"
              >
                View install stats →
              </Link>
            </GlassCard>

            <CreatorProfile creator={agent.creator} />
          </aside>
        </div>
      </Section>
    </div>
  );
}
