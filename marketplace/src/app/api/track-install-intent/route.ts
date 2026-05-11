import { recordInstall } from '@/lib/installs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ANON_COOKIE = 'gi_anon';

function randomId(): string {
  const a = new Uint8Array(16);
  crypto.getRandomValues(a);
  return Array.from(a, (b) => b.toString(16).padStart(2, '0')).join('');
}

export async function POST(req: Request) {
  let body: { agent_id?: unknown } = {};
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }
  const agentId = typeof body.agent_id === 'string' ? body.agent_id.trim() : '';
  if (!agentId || agentId.length > 80) {
    return NextResponse.json({ error: 'invalid_agent_id' }, { status: 400 });
  }

  const jar = await cookies();
  let anonId = jar.get(ANON_COOKIE)?.value;
  const setCookie = !anonId;
  if (!anonId) anonId = randomId();

  const total = await recordInstall({
    agentId,
    timestamp: Date.now(),
    source: 'x-intent',
    anonId,
  });

  const res = NextResponse.json({ ok: true, total });
  if (setCookie) {
    res.cookies.set(ANON_COOKIE, anonId, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      secure: process.env.NODE_ENV === 'production',
    });
  }
  return res;
}
