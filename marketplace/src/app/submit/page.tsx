import { SubmitForm } from '@/components/marketplace/SubmitForm';
import { CircuitTrace } from '@/components/ui/CircuitTrace';
import { NebulaBackdrop } from '@/components/ui/NebulaBackdrop';
import { Section, SectionHeader } from '@/components/ui/Section';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Submit your agent',
  description: 'Propose a Grok-native agent for the GrokInstall marketplace.',
};

export default function SubmitPage() {
  return (
    <div className="flex flex-col gap-10 pb-16">
      <section className="relative overflow-hidden border-b border-ink-300/40">
        <NebulaBackdrop intensity="normal" />
        <CircuitTrace className="opacity-25 mix-blend-screen" density="sparse" />
        <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-14 pb-10">
          <SectionHeader
            eyebrow="Submit"
            tone="cinnabar"
            title="Ship your Grok-native agent."
            description="Fill in the details below and we'll open a pre-populated pull request on awesome-grok-agents. Review is weekly."
          />
        </div>
        <div className="plate-divider" aria-hidden />
      </section>

      <Section>
        <SubmitForm />
      </Section>
    </div>
  );
}
