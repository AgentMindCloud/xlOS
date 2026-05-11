import { getAgents } from '@/lib/agents';
import { SITE_URL } from '@/lib/constants';
import type { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const agents = await getAgents();
  const now = new Date();
  const sections = ['trending', 'voice', 'swarm', 'new', 'beginner'] as const;

  const agentEntries: MetadataRoute.Sitemap = agents.map((a) => ({
    url: `${SITE_URL}/marketplace/${a.id}`,
    lastModified: new Date(a.updated_at),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const statsEntries: MetadataRoute.Sitemap = agents.map((a) => ({
    url: `${SITE_URL}/stats/agents/${a.id}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.5,
  }));

  const sectionEntries: MetadataRoute.Sitemap = sections.map((s) => ({
    url: `${SITE_URL}/marketplace/sections/${s}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.6,
  }));

  return [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/marketplace`, lastModified: now, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${SITE_URL}/hall-of-fame`, lastModified: now, changeFrequency: 'daily', priority: 0.6 },
    { url: `${SITE_URL}/stats`, lastModified: now, changeFrequency: 'hourly', priority: 0.6 },
    { url: `${SITE_URL}/submit`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    ...sectionEntries,
    ...agentEntries,
    ...statsEntries,
  ];
}
