import { telemetryPayloadSchema } from '@/lib/telemetry-schema';
import { checkRateLimit, recordTelemetry } from '@/lib/telemetry-store';
import { revalidateTag } from 'next/cache';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
  Vary: 'Origin',
};

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return corsJson({ error: 'invalid_json' }, 400);
  }

  const parsed = telemetryPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return corsJson({ error: 'invalid_payload', issues: parsed.error.issues.slice(0, 8) }, 400);
  }

  const { anon_install_id } = parsed.data;
  const limit = await checkRateLimit(anon_install_id);
  if (!limit.ok) {
    return new Response(JSON.stringify({ error: 'rate_limited' }), {
      status: 429,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'application/json',
        'Retry-After': Math.ceil(limit.resetMs / 1000).toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': Math.ceil(limit.resetMs / 1000).toString(),
      },
    });
  }

  await recordTelemetry(parsed.data);
  revalidateTag('telemetry');
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

function corsJson(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}
