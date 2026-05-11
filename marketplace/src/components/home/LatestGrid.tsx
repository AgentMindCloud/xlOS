import { AgentCard } from '@/components/marketplace/AgentCard';
import type { AgentWithStats } from '@/lib/types';

export function LatestGrid({ agents }: { agents: AgentWithStats[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {agents.map((agent) => (
        <AgentCard key={agent.id} agent={agent} />
      ))}
    </div>
  );
}
