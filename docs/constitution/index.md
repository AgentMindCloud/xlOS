---
title: Constitution
description: The 8 articles and 24 named checks the xlOS Constitution scanner enforces before any agent can be installed.
---

# Constitution

Every agent that ships with xlOS, every agent installed via the
browser extension, and every agent the CLI validates is checked
against the xlOS Constitution before it can run.

The Constitution is enforced in three layers:

1. **Schema** — the vendored `spec/v2.14/schema.json` makes the rules
   expressible (every Constitution clause maps to a manifest field
   directly or via the `extensions:` block).
2. **Scanner** — `src/xlos/safety/scanner.py` checks that each manifest
   satisfies the rules before it can be installed. The scanner exposes
   **24 named checks across 8 articles**.
3. **Runtime** — long-running agents consult the scanner periodically
   to ensure their state hasn't drifted from the declared safety
   posture.

The Constitution itself lives at `src/xlos/safety/constitution.md` in
the repo and is the authoritative source of the rule text.

> **Unconditional core.** Articles **I** (Universal rules), **III** (Hard
> refusals), and **VII** (Local-first & privacy-first) are scanned on every
> manifest regardless of declaration. The `extensions.constitution` array
> in a v2.14 manifest selects which *additional* articles (II, IV, V, VI,
> VIII) the agent opts into; it can never remove I, III, or VII.

## The 8 articles at a glance

| Article | Subject                                | Checks |
| ------- | -------------------------------------- | -----: |
| I       | Universal rules                        | 4      |
| II      | Consent gates                          | 3      |
| III     | Hard refusals                          | 4      |
| IV      | Provenance & truth                     | 2      |
| V       | Disclaimers (finance / tax / actions)  | 3      |
| VI      | Cost limits & human-in-the-loop        | 2      |
| VII     | Local-first & privacy-first            | 5      |
| VIII    | Enforcement                            | 1      |
| **Total** |                                      | **24** |

## The 24 named checks

### Article I — Universal rules

- **I.1 license** — Apache-2.0 required.
- **I.2 xai-positioning** — agent must declare its xAI ecosystem
  positioning; no agent may position itself as competing with xAI.
- **I.3 windows-requires-admin** — Windows installers must not require
  administrator privileges.
- **I.4 version** — manifest version field present and parseable.

### Article II — Consent gates

- **II.posts-consent** — any post-to-X capability declares the
  `publish_to_x` consent gate.
- **II.publish-gate** — any publish-synthesis capability declares the
  `publish_synthesis` consent gate.
- **II.action-gate-confirm-list** — every consent-gated action ships
  with a human-readable confirmation list.

### Article III — Hard refusals

- **III.no-forbidden-actions-flipped** — agents must not re-enable any
  action on the Article III hard-refusal list.
- **III.hard-refusal-blacklist** — every action the agent claims is
  cross-checked against the blacklist.
- **III.cite-sources-for-super-agent** — super-agents that synthesize
  output must set `provenance.cite_sources: true`.
- **III.append-only-provenance** — when provenance is enabled it must
  be append-only.

### Article IV — Provenance & truth

- **IV.super-agent-provenance** — super-agents must enable provenance.
- **IV.super-agent-constitution** — super-agents must declare their
  `constitution:` section (the additional articles beyond the
  unconditional core I / III / VII).

### Article V — Disclaimers

- **V.1 finance-disclaimer** — finance / investment / cashtag /
  portfolio tools must surface the V.1 banner.
- **V.2 tax-disclaimer** — tax tools must surface the V.2 banner.
- **V.3 real-world-action-disclaimer** — real-world-action agents must
  surface the V.3 banner.

### Article VI — Cost limits & HITL

- **VI.1 cost-limits** — paid-API agents must declare
  `safety.cost_limits`.
- **VI.2 hitl-for-consent-gates** — every consent gate has
  human-in-the-loop confirmation, typed not inferred.

### Article VII — Local-first & privacy-first

- **VII.pii-default** — PII handling defaults to `local-only`.
- **VII.appdata-paths-only** — agent filesystem writes are scoped to
  the user data directory.
- **VII.encryption-at-rest** — memory backends set
  `encryption_at_rest: true` for non-public data.
- **VII.data-retention-required** — data retention policy is declared.
- **VII.no-trackers** — no third-party trackers in any web UI surface.

### Article VIII — Enforcement

- **VIII.scanner-severity-floor** — the scanner's own severity floor
  may not be relaxed by an agent's manifest.

## Severity

The scanner emits findings at three severities:

- **info** — informational (e.g. recommended-but-not-required
  disclaimer absent).
- **warn** — should-fix (e.g. cost_limits omitted on a finance kind).
- **error** — blocks install / merge (e.g. license != Apache-2.0;
  super-agent without provenance).

No `error`-level finding may be silenced without an amendment to the
Constitution itself.

## Reading the source

- Full text: `src/xlos/safety/constitution.md` in the repo.
- Implementation: `src/xlos/safety/scanner.py`.
- The migration from the v2.15 working draft to the v2.14 vendored
  schema is described in
  [v2.15 → v2.14 + extensions migration](../migration/v215-to-v214-extensions.md).
