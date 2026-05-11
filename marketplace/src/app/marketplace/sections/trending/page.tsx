import { SectionPage } from '@/components/marketplace/SectionPage';
import { SECTIONS, getSectionAgents } from '@/lib/sections';
import type { Metadata } from 'next';

export const revalidate = 300;

const meta = SECTIONS.trending;
export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
};

export default async function TrendingPage() {
  const agents = await getSectionAgents('trending');
  return <SectionPage meta={meta} agents={agents} />;
}
