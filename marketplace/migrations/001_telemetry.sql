-- Telemetry schema for grokagents.dev.
-- Applied when Vercel Postgres is provisioned. Until then, lib/telemetry-store.ts
-- backs the same surface with Vercel KV (sorted sets) and an in-memory fallback
-- for local dev.

CREATE TABLE IF NOT EXISTS telemetry_events (
  id               SERIAL PRIMARY KEY,
  event            TEXT        NOT NULL,
  timestamp        TIMESTAMPTZ NOT NULL,
  cli_version      TEXT        NOT NULL,
  agent_category   TEXT,
  used_pro_mode    BOOLEAN,
  used_swarm       BOOLEAN,
  used_voice       BOOLEAN,
  safety_score     INT,
  agent_count      INT,
  success          BOOLEAN,
  anon_install_id  TEXT        NOT NULL,
  received_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_telemetry_received  ON telemetry_events (received_at DESC);
CREATE INDEX IF NOT EXISTS idx_telemetry_event     ON telemetry_events (event);
CREATE INDEX IF NOT EXISTS idx_telemetry_anon      ON telemetry_events (anon_install_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_category  ON telemetry_events (agent_category);

-- Retention: 90 days for individual rows, indefinite for aggregated counters.
-- Scheduled via a Vercel Cron hitting /api/telemetry/retention:
--   DELETE FROM telemetry_events WHERE received_at < NOW() - INTERVAL '90 days';
