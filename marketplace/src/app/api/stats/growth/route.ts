import { type Period, getGrowthSeries } from '@/lib/telemetry-queries';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const revalidate = 30;

const PERIODS: Period[] = ['7d', '30d', '90d'];
const METRICS = ['installs', 'posts', 'savings'] as const;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const period = (url.searchParams.get('period') ?? '30d') as Period;
  const metric = (url.searchParams.get('metric') ?? 'installs') as (typeof METRICS)[number];
  if (!PERIODS.includes(period) || !METRICS.includes(metric)) {
    return NextResponse.json({ error: 'invalid_params' }, { status: 400 });
  }
  const series = await getGrowthSeries(period, metric);
  return NextResponse.json(
    { period, metric, series },
    {
      headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120' },
    }
  );
}
