import type { Category, Certification } from './types';

export const SITE_NAME = 'GrokInstall';
export const SITE_TAGLINE = 'Built for Grok on X';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://grokagents.dev';

export const DISCLAIMER =
  'GrokInstall is an independent community project. Not affiliated with xAI, Grok, or X.';

export const FEATURED_AGENTS_URL =
  'https://raw.githubusercontent.com/AgentMindCloud/awesome-grok-agents/main/featured-agents.json';

export const GITHUB_ORG = 'AgentMindCloud';
export const PR_TEMPLATE_URL =
  'https://github.com/AgentMindCloud/awesome-grok-agents/blob/main/.github/PULL_REQUEST_TEMPLATE.md';
export const NEW_ISSUE_URL =
  'https://github.com/AgentMindCloud/awesome-grok-agents/issues/new/choose';

export const NAV_ITEMS = [
  { href: '/marketplace', label: 'Marketplace' },
  { href: '/stats', label: 'Stats' },
  { href: '/hall-of-fame', label: 'Hall of Fame' },
  { href: '/submit', label: 'Submit' },
  { href: 'https://docs.grokinstall.dev', label: 'Docs', external: true },
  { href: 'https://github.com/AgentMindCloud', label: 'GitHub', external: true },
] as const;

export const CATEGORY_LABELS: Record<Category, string> = {
  productivity: 'Productivity',
  research: 'Research',
  content: 'Content',
  developer: 'Developer',
  voice: 'Voice',
  swarm: 'Swarm',
  analytics: 'Analytics',
  marketing: 'Marketing',
  education: 'Education',
};

export const CERTIFICATION_LABELS: Record<Certification, string> = {
  'grok-native': 'Grok-Native',
  'safety-max': 'Safety Max',
  'voice-ready': 'Voice-Ready',
  'swarm-ready': 'Swarm-Ready',
  'action-certified': 'Action-Certified',
  'vscode-verified': 'VS Code Verified',
};

export const SORT_OPTIONS = [
  { value: 'trending', label: 'Trending' },
  { value: 'newest', label: 'Newest' },
  { value: 'most-installed', label: 'Most Installed' },
] as const;
