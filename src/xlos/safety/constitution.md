<!-- Copyright 2026 AgentMindCloud -->
<!-- Licensed under the Apache License, Version 2.0 -->
<!-- http://www.apache.org/licenses/LICENSE-2.0 -->

# Agent Constitution — xlOS

> **Version 1.0** · Ported to xlOS · 2026-05
> Adapted from the grok-agent Constitution. Each article is selectable
> per-manifest via `extensions.constitution`. Manifests that do not declare
> any article opt out of Constitution checks.

xlOS enforces the Constitution through two layers:

1. **Schema** — `spec/v2.14/schema.json` (vendored from grok-install-v2).
2. **Scanner** — `xlos.safety.scanner.scan_manifest()`. Runs only the
   articles a manifest declares in `extensions.constitution`.

---

## Article I — Universal Rules

- License must be Apache-2.0.
- The manifest must not position the agent as a competitor to xAI or Grok.

The scanner flags `description` text containing forbidden positioning
phrases ("compete with xai", "replace xai", "alternative to grok", etc).

## Article II — Consent Gates

Agents that expose publish-style tools must declare a corresponding
`publish_to_x` (or equivalent) gate inside
`extensions.multi_agent_roles.consent_gates`. The scanner emits a `warn`
finding when a tool name or description implies posting to X without a
matching declared gate.

## Article III — Hard Refusals

The following actions may never appear as consent gates:

- `scrape_authenticated_x_content`
- `impersonate_user_identity`
- `bypass_safety_scanner`
- `exfiltrate_user_data`

Any of those in `consent_gates` is an `error` finding.

## Article IV — Provenance & Truth

Super-agents (`category: super-agent`) must enable provenance and source
citation:

- `extensions.provenance.enabled: true`
- `extensions.provenance.cite_sources: true`

Either being absent or explicitly `false` is an `error` finding.

## Article V — Disclaimers

- **V.1 — Not financial advice.** X Money tools (`category: x-money-tool`)
  must set `extensions.x_money_specific.disclaimers.not_financial_advice:
  true`.
- **V.2 — Not tax advice.** X Money tools should set
  `extensions.x_money_specific.disclaimers.not_tax_advice: true` when they
  expose tax export flows.

## Article VI — Cost Limits & Human-in-the-Loop

X Money tools and super-agents must declare a top-level `cost_limits`
block describing usd/day caps and session-level call budgets.

## Article VII — Local-First & Privacy-First

The manifest must not reference absolute drive paths (`C:\\`, `/usr/`,
`/etc/`, `/var/`) or third-party analytics trackers
(`google-analytics.com`, `googletagmanager.com`, `mixpanel.com`,
`segment.io`, `amplitude.com`). Either is an `error` finding.

## Article VIII — Enforcement

The scanner walks the manifest for vague guidance like "etc.", "and so
on", "anything related to", "as you see fit", "use your judgment". The
finding is `warn` — copy-and-paste prose review, not a hard refusal.

## Article IX — Amendment & Versioning

Informational: no machine-checkable rule today. The scanner accepts
`IX` in `extensions.constitution` so manifests can declare the article
without producing a "no such check" diagnostic.

---

## How to declare which articles apply

```yaml
extensions:
  constitution:
    - II
    - V.1
    - VII
```

Or in long form:

```yaml
extensions:
  constitution:
    articles:
      - II
      - V.1
      - VII
    rules:
      - "Single-axis isolation. Variants vary on one dimension only."
```

The scanner reads `extensions.constitution[*]` (array form) and
`extensions.constitution.articles[*]` (dict form) interchangeably.
