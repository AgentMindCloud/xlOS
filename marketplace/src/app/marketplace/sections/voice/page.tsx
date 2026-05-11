import { SectionPage } from '@/components/marketplace/SectionPage';
import { SECTIONS, getSectionAgents } from '@/lib/sections';
import type { Metadata } from 'next';

export const revalidate = 600;

const meta = SECTIONS.voice;
export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
};

export default async function VoicePage() {
  const agents = await getSectionAgents('voice');
  return <SectionPage meta={meta} agents={agents} />;
}
