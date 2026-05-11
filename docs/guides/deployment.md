---
title: Deployment
description: Production deployment patterns — secrets, logs, observability, rollback.
---

# Deployment

This guide goes beyond the per-target quickstart and covers the
operational pieces you need for real traffic.

See [Getting started → Deploy](../getting-started/deploy.md) first.

## Secret management

Rule: **no secrets in YAML**. The Constitution scanner fails the
install if it sees anything that looks like a key.

- **Dev**: `export XAI_API_KEY=...` in your shell, or `.env`
  (gitignored).
- **Vercel / Netlify**: Platform env var dashboard.
- **Railway / Render**: Service-level env vars.
- **Docker**: `--env-file` at run time, or inject via orchestrator
  (Kubernetes secrets, Nomad, ECS task definitions).
- **CI (GitHub Actions)**: `secrets.XAI_API_KEY` → jobs that call
  `xlos install` or `xlos run`.

Every key in `grok-install.yaml` → `env:` must resolve at agent boot or
the runtime refuses to start.

## Logs

The runtime emits structured JSON to stdout. Pipe to whatever your
platform aggregates (Vercel Logs, Railway Logs, Datadog, Loki, Cloud
Logging). All runtime events are `xlos.*`-prefixed, so a single filter
separates agent traffic from framework noise.

## Scheduled agents

If `grok-install.yaml` declares:

```yaml
schedule:
  interval: 5m
```

…the agent boots, runs one iteration, and exits. Your platform's
scheduler ticks it. Vercel Cron and Railway's built-in scheduler both
work; Docker deployments need an external scheduler (cron, systemd
timer, Kubernetes CronJob).

## Cold start

| Platform | Typical cold start | Notes                                            |
| -------- | ------------------ | ------------------------------------------------ |
| Vercel   | ~1.5s              | Use `grok-4-mini` for sub-second first-token.    |
| Railway  | None (warm)        | Always-on dyno; pay for idle time.               |
| Docker   | Depends            | You own the scaling story.                       |
| Replit   | ~3s                | Good for personal, not for production traffic.   |

## Rollback

Agents are pure YAML + a Python tool directory. To roll back, revert
the commit and reinstall. The runtime doesn't hold onto state across
versions unless you explicitly write to a persistent store.

If you need blue-green behavior: install the new version under a
different name, smoke-test with `xlos run <new-name>` locally, then
swap the user-facing route.

## Cost guardrails

Three levers, all in `grok-security.yaml`:

```yaml
rate_limits:
  tool_calls_per_minute: 30
  web_fetches_per_run: 60
  total_tokens_per_run: 100000
```

And one in `grok-agent.yaml` — `max_turns: N` caps runaway
reason-then-call loops at the conversation level. Constitution Article
VI also requires cost ceilings declared in `safety.cost_limits`.

## Zero-downtime config changes

Most edits are safe to hot-deploy. The exceptions:

| Change                                             | Safe? | Why                                              |
| -------------------------------------------------- | :---: | ------------------------------------------------ |
| Prompt text                                        | yes   | Reloaded on next invocation.                     |
| Tool added + permission added                      | yes   | New capability, no existing behavior broken.     |
| Tool removed from `permissions:`                   | no    | In-flight runs referencing the tool will fail.   |
| `spec:` bumped across minor version                | no    | Re-validate in staging first.                    |
| `safety_profile` strict → standard                 | no    | Re-review the scan output before shipping.       |
