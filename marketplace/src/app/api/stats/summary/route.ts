import { getAgents } from '@/lib/agents';
import { getAllTotals, getCounts } from '@/lib/installs';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const revalidate = 300;

export async function GET() {
  const [agents, totals] = await Promise.all([getAgents(), getAllTotals()]);

  const perAgent = await Promise.all(
    agents.map(async (a) => {
      const live = await getCounts(a.id);
      const total = Math.max(a.installs ?? 0, totals.get(a.id) ?? 0, live.total);
      return {
        id: a.id,
        name: a.name,
        category: a.category,
        certifications: a.certifications,
        safetyScore: a.safetyScore ?? null,
        installs: total,
        last7d: live.last7d,
        last24h: live.last24h,
      };
    })
  );

  const totalInstalls = perAgent.reduce((n, a) => n + a.installs, 0);
  const last7dInstalls = perAgent.reduce((n, a) => n + a.last7d, 0);
  const last24hInstalls = perAgent.reduce((n, a) => n + a.last24h, 0);

  const creators = new Set(agents.map((a) => a.creator.handle));

  return NextResponse.json(
    {
      generatedAt: new Date().toISOString(),
      totals: {
        agents: agents.length,
        creators: creators.size,
        installs: totalInstalls,
        last7dInstalls,
        last24hInstalls,
      },
      agents: perAgent,
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    }
  );
}
