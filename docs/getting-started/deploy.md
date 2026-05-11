---
title: Deploy to production
description: Ship your xlOS agent to Vercel, Railway, Docker, or Replit.
---

# Deploy to production

xlOS itself is a runtime, not a hosting product — your agent runs
wherever you can install a Python package and provide the env vars it
needs. Below are the four common targets, each with the gotchas
specific to that platform.

## Pick a target

| Target  | Best for                               | Cold start | Schedules |
| ------- | -------------------------------------- | ---------- | --------- |
| Vercel  | HTTP agents, webhook handlers          | ~1.5s      | Cron      |
| Railway | Long-running schedulers, scrapers      | persistent | Built-in  |
| Docker  | Self-hosted, on-prem, custom K8s       | depends    | External  |
| Replit  | Hackathons, low-stakes shared envs     | ~3s        | Replit Cron |

## Vercel

Use Vercel's Python runtime. Add a single handler that invokes your
agent through the xlOS Python API (`xlos.runtime.run_command`).

Set `XAI_API_KEY` in the Vercel dashboard under **Settings →
Environment Variables**. Any other env var from `grok-install.yaml` →
`env:` needs to be added here too.

## Railway

`pip install xlos` in your service, then call `xlos run <agent>` from
your start command. For scheduled agents (`schedule.interval: 5m`)
Railway's built-in cron picks up the worker process from your
`Procfile`.

## Docker

```dockerfile
FROM python:3.11-slim
RUN pip install xlos
COPY . /app
WORKDIR /app
USER nobody
CMD ["xlos", "run", "my-agent"]
```

The image is non-root by default. If your agent writes to disk, mount
a writable volume — the runtime stays read-only otherwise.

## Replit

```bash
pip install xlos
xlos install ./grok-install.yaml
```

Commit `.replit` with the run command and Replit's cron handles
scheduling.

## Common deployment pitfalls

!!! failure "Missing env var in the platform"
    Every name in `grok-install.yaml` → `env:` must also exist in your
    platform's secret manager, or the agent refuses to boot.

!!! failure "Schedule not firing"
    Railway + Vercel require the schedule to be configured in *their*
    system too. `schedule:` in YAML is the declaration; the platform
    still needs to actually tick the clock.

!!! failure "Network permission denied in production"
    `grok-security.yaml` is enforced identically in dev and prod. If a
    tool talks to a new host, add it to `permissions:` and redeploy.

## Marketplace deployment

The bundled marketplace (`marketplace/` in the repo) is a Next.js 15
discovery surface and deploys to any Node host. A `marketplace.yml`
workflow generates the prerendered site on push to `main`.
