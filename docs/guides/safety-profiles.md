---
title: Safety profiles
description: standard vs strict, approval gates, and rate-limit strategy.
---

# Safety profiles

The runtime treats `grok-security.yaml` as the single source of truth
for what an agent is *allowed* to do. Profiles are shorthand for
sensible defaults; the explicit keys always win. The
[Constitution scanner](../constitution/index.md) cross-checks every
profile against its 24 named checks before install.

## `standard`

The research-friendly default. Tools are allowed if listed in
`permissions:`. Networking is allowed if the host is listed. Rate
limits are enforced, but no tool requires approval unless you add it.

Good for: research, drafting, internal tools, anything read-heavy.

```yaml
safety_profile: standard
permissions:
  - tool:web_search
  - tool:fetch_page
  - network:*
rate_limits:
  tool_calls_per_minute: 40
  web_fetches_per_run: 60
```

## `strict`

Every destructive or outbound action is gate-walled. The runtime is
more conservative with rate limits, and the scanner treats
`network:*` as a warning instead of a quiet pass.

Good for: anything that posts, pays, deletes, or messages users.

```yaml
safety_profile: strict
permissions:
  - tool:fetch_mentions
  - tool:draft_reply
  - tool:post_reply
  - network:api.twitter.com
requires_approval:
  - post_reply
rate_limits:
  tool_calls_per_minute: 15
```

## Approval gates

A tool in `requires_approval:` pauses the run. The operator sees a
plain-text plan of what's about to run with its arguments, and must
type confirmation before the tool fires. `s`kip returns a
`tool_skipped` signal to the model so it can adapt; `q`uit aborts.

In non-interactive deploys (Vercel, Railway), approval gates route to
a queue — wire a webhook via `XLOS_APPROVAL_WEBHOOK_URL` to Slack,
Discord, or email.

This maps directly to **Constitution Article II — Consent Gates**.

## Rate limits

| Key                     | What it caps                                  | When it trips                               |
| ----------------------- | --------------------------------------------- | ------------------------------------------- |
| `tool_calls_per_minute` | Every tool invocation across the agent        | Hot loops, runaway reasoning                |
| `web_fetches_per_run`   | Network egress                                | Scraper abuse, API bill surprises           |
| `total_tokens_per_run`  | LLM tokens consumed in one run                | Runaway context growth                      |

Tripping a limit raises a tool-use error back to the model ("rate
limit reached — try again in 37s"), not a hard crash. The agent can
choose to stop or keep going with different tools.

## Scoping permissions

Format: `<scope>:<target>`.

| Scope        | Example                     | Notes                                           |
| ------------ | --------------------------- | ----------------------------------------------- |
| `tool`       | `tool:web_search`           | Must match the tool name used in `grok-agent.yaml`. |
| `network`    | `network:api.tavily.com`    | Hostname match. Globs allowed: `*.arxiv.org`.   |
| `network`    | `network:*`                 | Wildcard — triggers a scanner warning.          |
| `filesystem` | `filesystem:/tmp/cache/*`   | Agents are sandboxed to `/tmp` by default.      |
| `env`        | `env:TAVILY_API_KEY`        | Narrows which env vars the tool sees.           |

## Cost limits

Per **Constitution Article VI**, every agent that calls paid APIs must
declare `safety.cost_limits`. Defaults the scanner enforces:

| Field                     | Default |
| ------------------------- | ------- |
| `usd_per_session_max`     | 1.00    |
| `usd_per_day_max`         | 5.00    |
| `tokens_per_session_max`  | 200,000 |
| `api_calls_per_session_max` | 500   |

When a limit is reached the agent must halt and ask the user to extend
or cancel. There is no silent extension.

## Common misconfigurations

!!! failure "Tool listed in `tools:`, missing from `permissions:`"
    Hard error from the scanner. The fix is one line in
    `grok-security.yaml`.

!!! failure "`network:*` with `safety_profile: strict`"
    Legal, but the scanner will flag it. Consider narrowing the host
    list — strict profiles usually shouldn't need the open web.

!!! failure "Approval on a tool that doesn't exist"
    `requires_approval: [post_thread]` + no such tool → validation
    error. Cross-checked at install time.

## See also

- **[Constitution](../constitution/index.md)** — the 8 articles and 24
  named checks the scanner enforces.
