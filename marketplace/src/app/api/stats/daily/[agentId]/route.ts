import { getDailyCounts } from '@/lib/installs';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const revalidate = 300;

export async function GET(_req: Request, { params }: { params: Promise<{ agentId: string }> }) {
  const { agentId } = await params;
  if (!/^[a-z0-9-]{1,80}$/i.test(agentId)) {
    return NextResponse.json({ error: 'invalid_agent_id' }, { status: 400 });
  }
  const daily = await getDailyCounts(agentId, 30);
  return NextResponse.json(
    { agentId, days: daily.length, series: daily },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    }
  );
}
