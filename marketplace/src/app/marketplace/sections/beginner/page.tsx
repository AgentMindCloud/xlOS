import { SectionPage } from '@/components/marketplace/SectionPage';
import { SECTIONS, getSectionAgents } from '@/lib/sections';
import type { Metadata } from 'next';

export const revalidate = 600;

const meta = SECTIONS.beginner;
export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
};

export default async function BeginnerPage() {
  const agents = await getSectionAgents('beginner');
  return <SectionPage meta={meta} agents={agents} />;
}
