import { NextResponse } from 'next/server';
import {
  getActiveAgents7d,
  getApiCallsSaved,
  getCategoryBreakdown,
  getTotalAgentsInstalled,
  getTotalCreators,
  getXPostsGenerated,
} from '@/lib/telemetry-queries';
import { checkIpRateLimit } from '@/lib/telemetry-store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function clientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0]!.trim();
  const real = req.headers.get('x-real-ip');
  if (real) return real.trim();
  return 'unknown';
}

export async function GET(req: Request) {
  const ip = clientIp(req);
  const limit = await checkIpRateLimit(ip);
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'rate_limited' },
      {
        status: 429,
        headers: {
          'Retry-After': Math.ceil(limit.resetMs / 1000).toString(),
          'X-RateLimit-Remaining': '0',
        },
      }
    );
  }

  const [totalAgents, posts, apiSaved, active7d, creators, categories] = await Promise.all([
    getTotalAgentsInstalled(),
    getXPostsGenerated(),
    getApiCallsSaved(),
    getActiveAgents7d(),
    getTotalCreators(),
    getCategoryBreakdown(),
  ]);

  return NextResponse.json(
    {
      generatedAt: new Date().toISOString(),
      totals: {
        agentsInstalled: totalAgents,
        xPostsGenerated: posts,
        apiCallsSaved: apiSaved,
        activeAgents7d: active7d,
        creators,
      },
      categories,
    },
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120',
        'X-RateLimit-Remaining': String(limit.remaining),
      },
    }
  );
}

export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
