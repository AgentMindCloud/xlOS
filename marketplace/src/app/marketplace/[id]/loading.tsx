import { Section } from '@/components/ui/Section';

export default function Loading() {
  return (
    <div className="pt-10 pb-16">
      <Section>
        <div className="flex flex-col gap-4 mb-10">
          <div className="h-3 w-24 shimmer rounded-sm" />
          <div className="h-10 w-3/4 max-w-xl shimmer rounded-sm" />
          <div className="h-5 w-5/6 max-w-2xl shimmer rounded-sm" />
          <div className="flex gap-1.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-6 w-24 shimmer rounded-sm" />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_340px]">
          <div className="flex flex-col gap-8">
            <div className="h-40 shimmer rounded-lg" />
            <div className="h-64 shimmer rounded-md" />
            <div className="h-40 shimmer rounded-md" />
          </div>
          <div className="flex flex-col gap-4">
            <div className="h-40 shimmer rounded-lg" />
            <div className="h-24 shimmer rounded-lg" />
          </div>
        </div>
      </Section>
    </div>
  );
}
