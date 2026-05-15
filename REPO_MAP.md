# Repo Map

Machine-readable source: [`repo-map.json`](repo-map.json). This is the honesty ledger — `available` means it runs end-to-end with passing tests; `spec` means manifest-only (implementation being rebuilt).

**34 agents** — 2 available, 32 spec.

## Sections

- `grok-install/` — Agent install standard: standard, validator, templates, mint flow.
- `agents/` — The agent library (creator-x-co-pilot, super-agents, creator, finance).
- `src/xlos/` — The cross-platform Python runtime: CLI, install, run, validators, safety.
- `spec/v2.14/` — Vendored read-only v2.14 schema (source of truth; see VENDOR.md).
- `packages/grok_paradoxes/` — Standalone tested package; Living Narrative Fabric builds on it.
- `tools/` — X-native creator tools (single-file HTML + one hybrid).
- `marketplace/` — Next.js 15 discovery surface (status-driven, honest).
- `extensions/browser/` — Manifest v3 browser extension (one-click install from X).
- `docs/` — CLI reference, authoring guide, v2.15->v2.14 migration mapping, Constitution.

## Agents

| Agent | Section | Tier | Status | Run |
|---|---|---|---|---|
| ab-test-suggester | creator | heavy | spec | `—` |
| analytics-summarizer | creator | heavy | spec | `—` |
| brand-voice-trainer | creator | heavy | spec | `—` |
| comment-engagement-booster | creator | heavy | spec | `—` |
| competitor-watch | creator | heavy | spec | `—` |
| content-calendar-builder | creator | heavy | spec | `—` |
| content-idea-generator | creator | heavy | spec | `—` |
| content-recycler | creator | heavy | spec | `—` |
| cross-platform-reposter | creator | heavy | spec | `—` |
| daily-briefing-agent | creator | heavy | spec | `—` |
| dm-triager | creator | heavy | spec | `—` |
| follower-quality-analyzer | creator | heavy | spec | `—` |
| growth-experiment-runner | creator | heavy | spec | `—` |
| hashtag-strategy-advisor | creator | heavy | spec | `—` |
| mention-summarizer | creator | heavy | spec | `—` |
| monetization-optimizer | creator | heavy | spec | `—` |
| niche-influencer-finder | creator | heavy | spec | `—` |
| quote-tweet-suggestor | creator | heavy | spec | `—` |
| reply-drafter | creator | heavy | spec | `—` |
| research-assistant | creator | heavy | spec | `—` |
| thread-builder | creator | heavy | spec | `—` |
| trend-aligned-poster | creator | heavy | spec | `—` |
| x-creator-payout-optimizer | finance | heavy | spec | `—` |
| x-money-companion-dashboard | finance | heavy | spec | `—` |
| x-money-vision-analyzer | finance | heavy | spec | `—` |
| x-smart-cashtag-alpha-engine | finance | heavy | spec | `—` |
| creator-x-co-pilot | flagship | light | available | `agents/flagship/creator-x-co-pilot/light/prompt.md` |
| agent-swarm-with-shared-memory | super-agents | heavy | spec | `—` |
| cross-reality-action-fabric | super-agents | heavy | spec | `—` |
| living-narrative-fabric | super-agents | heavy | available | `xlos run living-narrative-fabric` |
| narrative-contradiction-detector | super-agents | heavy | spec | `—` |
| provenance-first-trust-engine | super-agents | heavy | spec | `—` |
| self-evolving-personal-os | super-agents | heavy | spec | `—` |
| zero-config-i-want-to-agent | super-agents | heavy | spec | `—` |
