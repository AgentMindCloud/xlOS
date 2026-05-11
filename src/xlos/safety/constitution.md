<!-- Copyright 2026 AgentMindCloud -->
<!-- Licensed under the Apache License, Version 2.0 -->
<!-- http://www.apache.org/licenses/LICENSE-2.0 -->

# Agent Constitution — xlOS Safety Scanner

> **Version 1.0** · Imported from AgentMindCloud/grok-agent main.
> **Status: in force for any xlOS agent that declares `extensions.constitution`.**
> Agents without `extensions.constitution` are NOT Constitution-checked
> (scan_manifest returns an empty result for them).

This Constitution is enforced by `xlos.safety.scanner.scan_manifest`. It is
a port of the grok-agent v1.0 Constitution, refactored for v2.14 + extensions
manifests:

- v2.15 `safety.cost_limits` → v2.14 top-level `cost_limits`
- v2.15 `constitution.*`      → v2.14 `extensions.constitution.*`
- v2.15 `safety.disclaimers`  → v2.14 `extensions.x_money_specific.disclaimers`
- v2.15 `safety.forbidden_actions`, `safety.human_in_the_loop` → `extensions.safety_policy.*`
- v2.15 `provenance.*`        → v2.14 `extensions.provenance.*`
- v2.15 `multi_agent.*`       → v2.14 `extensions.multi_agent_roles.*`
- v2.15 `kind`                → v2.14 top-level `category`

---

## Article I — Universal Rules

I.1 — `license` may not be set to a non-Apache-2.0 string when declared.

I.2 — `description` and `extensions.metadata.tagline` may not contain forbidden
positioning phrases (compete with xai / replace xai / alternative to grok /
replacement for grok / anti-xai).

## Article II — Consent Gates

II.posts-consent — If the agent declares it posts to X, it must declare an
explicit `publish_to_x` consent gate. Defaults are never silent.

II.publish-gate — `publish_to_x` must appear in
`extensions.constitution.consent_gates` when posting is enabled.

## Article III — Hard Refusals

III.no-forbidden-actions-flipped — An action that appears in
`extensions.safety_policy.forbidden_actions` MUST NOT also appear in
`extensions.constitution.consent_gates` — a forbidden action cannot be
re-enabled via consent.

III.hard-refusal-blacklist — Categorically refused actions (scrape_authenticated_x_content,
impersonate_user_identity, bypass_safety_scanner, exfiltrate_user_data) must
not appear as consent gates even with HITL or disclaimers in place.

III.append-only-provenance — When `extensions.provenance.enabled` is true,
`extensions.provenance.append_only` MUST be true.

## Article IV — Provenance & Truth

IV.super-agent-provenance — `category: super-agent` requires
`extensions.provenance.enabled: true`.

IV.super-agent-constitution — `category: super-agent` requires
`extensions.constitution.rules` (at least one rule).

## Article V — Disclaimers

V.1-finance-disclaimer — `category: x-money-tool` requires
`extensions.x_money_specific.disclaimers.not_financial_advice: true`.

V.3-real-world-action-disclaimer — Agents with consent gates that touch
real-world actions (publish_, send_, move_, pay_, modify_, delete_) MUST
also set `extensions.x_money_specific.disclaimers.real_world_action_consent`
or include it in their `extensions.safety_policy`.

## Article VI — Cost Limits & HITL

VI.1-cost-limits-for-finance-and-super-agent — `category: x-money-tool` and
`category: super-agent` should declare `cost_limits` (top-level) with
`usd_per_session_max`, `usd_per_day_max`, and `tokens_per_session_max`.

VI.2-hitl-for-consent-gated-agents — When any `consent_gates` are declared
under `extensions.constitution`, `extensions.safety_policy.human_in_the_loop`
must be set with `enabled: true`.

## Article VII — Local-First & Privacy-First

VII.pii-default — Finance + super-agent categories should set
`extensions.safety_policy.pii_handling` to `local-only` or `redacted-cloud`.

VII.data-retention-required — Finance + super-agent categories should declare
`extensions.safety_policy.data_retention_days`.

## Article VIII — Audit & Self-Improvement

VIII.scanner-severity-floor — `extensions.safety_policy.scanner_severity_floor`
when declared must be one of (info, warn, error).

VIII.severity-floor-not-info — Finance + super-agent categories should not
run with `info` floor.

---

## How declared articles map to checks

The scanner reads `extensions.constitution.articles` (or, as a fallback, the
set of articles parsed out of `extensions.constitution.rules` text). For each
declared article, it runs only the matching checks listed above. Agents
without `extensions.constitution` are skipped entirely.
