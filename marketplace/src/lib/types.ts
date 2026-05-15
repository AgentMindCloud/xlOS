export type Certification =
  | 'grok-native'
  | 'safety-max'
  | 'voice-ready'
  | 'swarm-ready'
  | 'action-certified'
  | 'vscode-verified';

export type Category =
  | 'productivity'
  | 'research'
  | 'content'
  | 'developer'
  | 'voice'
  | 'swarm'
  | 'analytics'
  | 'marketing'
  | 'education';

export interface AgentCreator {
  handle: string;
  github?: string;
  x?: string;
  avatar?: string;
  agentCount?: number;
}

export interface AgentYamlSample {
  filename: string;
  lang: 'yaml';
  content: string;
}

export type VisualAccent = 'plasma' | 'aurora' | 'cyan' | 'green';
export type VisualStyle = 'futuristic' | 'premium' | 'minimal';

export type AgentDemoMedia =
  | { kind: 'gif'; url: string; poster?: string }
  | { kind: 'video'; url: string; poster?: string }
  | { kind: 'image'; url: string; poster?: string }
  | { kind: 'auto_generate' };

export interface AgentVisuals {
  style: VisualStyle;
  accent_color: VisualAccent;
  demo_media: AgentDemoMedia;
  headline?: string;
  subheadline?: string;
}

// 'available' = implementation present (Heavy impl/ or a Light prompt) so the
// agent genuinely runs. 'spec' = manifest-only specification, implementation
// being rebuilt. Certifications are only asserted for 'available' agents.
export type AgentStatus = 'available' | 'spec';

export interface Agent {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: Category;
  status: AgentStatus;
  tags: string[];
  certifications: Certification[];
  creator: AgentCreator;
  repo: string;
  homepage?: string;
  demo_url?: string;
  x_install_url?: string;
  created_at: string;
  updated_at: string;
  installs: number;
  safetyScore?: number;
  yaml?: AgentYamlSample;
  featured?: boolean;
  visuals?: AgentVisuals;
}

export interface AgentWithStats extends Agent {
  stars: number;
  starsFetchedAt: number;
  starsStale?: boolean;
}

export type SortKey = 'trending' | 'newest' | 'most-installed';

export interface MarketplaceFilters {
  q: string;
  categories: Category[];
  certifications: Certification[];
  sort: SortKey;
}
