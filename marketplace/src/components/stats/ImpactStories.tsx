import { GlassCard } from '@/components/ui/GlassCard';
import { CATEGORY_LABELS } from '@/lib/constants';
import type { Category } from '@/lib/types';
import { formatCount } from '@/lib/utils';
import { Rocket, Sparkles, Target } from 'lucide-react';

export interface ImpactStoriesInput {
  categories: { category: string; count: number }[];
  posts: number;
  apiSaved: number;
}

const ICONS = [Rocket, Sparkles, Target];

function copy(category: string, count: number): { title: string; body: string } {
  const label =
    category === 'other' ? 'Other' : (CATEGORY_LABELS[category as Category] ?? category);
  if (category === 'voice') {
    return {
      title: `${label} agents ran hot this week.`,
      body: `${formatCount(count)} hands-free installs — the Voice-Ready spec is getting real-world miles.`,
    };
  }
  if (category === 'swarm') {
    return {
      title: `${label} deployments are scaling up.`,
      body: `${formatCount(count)} multi-agent installs in the last 30 days. Coordinators, get in here.`,
    };
  }
  if (category === 'developer') {
    return {
      title: `${label} tooling keeps shipping.`,
      body: `${formatCount(count)} developer-category installs. VS Code and CLI are pulling their weight.`,
    };
  }
  return {
    title: `${label} leads the chart.`,
    body: `${formatCount(count)} ${label.toLowerCase()} installs in the last 30 days.`,
  };
}

export function ImpactStories({ categories, posts, apiSaved }: ImpactStoriesInput) {
  const top = [...categories].sort((a, b) => b.count - a.count).slice(0, 2);
  const stories = top.map((c) => copy(c.category, c.count));

  // Always round out to 3 cards with a savings highlight
  const savingsStory = {
    title: 'Pro Mode is doing the lifting.',
    body: `~${formatCount(apiSaved)} API calls saved and ${formatCount(
      posts
    )} X posts generated — the batch compiler earns its keep.`,
  };

  const all = [...stories, savingsStory].slice(0, 3);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {all.map((s, i) => {
        const Icon = ICONS[i % ICONS.length]!;
        return (
          <GlassCard key={s.title} padding="lg" className="flex flex-col gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-sm border border-cyan/40 bg-cyan/5 text-cyan">
              <Icon className="h-4 w-4" />
            </div>
            <h3 className="font-display text-lg tracking-tight text-ink">{s.title}</h3>
            <p className="text-sm text-ink-muted leading-relaxed">{s.body}</p>
          </GlassCard>
        );
      })}
    </div>
  );
}
