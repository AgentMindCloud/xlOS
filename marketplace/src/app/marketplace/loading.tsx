import { AgentCardSkeleton } from '@/components/marketplace/AgentCard';
import { Section } from '@/components/ui/Section';

export default function Loading() {
  return (
    <div className="pt-10 pb-16">
      <Section>
        <div className="mb-8 flex flex-col gap-3">
          <div className="h-4 w-24 shimmer rounded-sm" />
          <div className="h-10 w-3/4 max-w-xl shimmer rounded-sm" />
          <div className="h-4 w-5/6 max-w-2xl shimmer rounded-sm" />
        </div>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr] lg:gap-10">
          <aside className="space-y-4">
            <div className="h-11 w-full shimmer rounded-md" />
            <div className="h-6 w-24 shimmer rounded-sm" />
            <div className="flex flex-wrap gap-1.5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-7 w-20 shimmer rounded-sm" />
              ))}
            </div>
          </aside>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <AgentCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </Section>
    </div>
  );
}
