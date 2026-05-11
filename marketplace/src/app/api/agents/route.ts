import { getAgents } from '@/lib/agents';
import { getAllTotals } from '@/lib/installs';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const revalidate = 60;

export async function GET() {
  const [agents, totals] = await Promise.all([getAgents(), getAllTotals()]);
  const merged = agents.map((a) => ({
    ...a,
    installs: Math.max(a.installs ?? 0, totals.get(a.id) ?? 0),
  }));
  return NextResponse.json(
    { agents: merged, generatedAt: new Date().toISOString() },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    }
  );
}
