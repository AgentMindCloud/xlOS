# v2.15 → v2.14 + extensions migration mapping

This document specifies how grok-agent's internal v2.15 manifest shape is
projected into the vendored v2.14 spec consumed by xlOS.

The v2.14 schema in `spec/v2.14/schema.json` is the authoritative source for
xlOS at install time. v2.15 is grok-agent's working draft and is not vendored;
xlOS only consumes the projection below.

## Field-by-field mapping

| v2.15 field | v2.14 destination | Notes |
|---|---|---|
| `metadata.constitution_articles` | `extensions.constitution` | Array of article refs (strings, e.g. `"A1"`, `"A2"`); falls under the `additionalProperties: true` of the `extensions` object. |
| `multi_agent.role` / `multi_agent.roles` | `extensions.multi_agent_roles` | Role declarations for super-agents that coordinate sub-agents. |
| `provenance.*` | `extensions.provenance` | Citation / confidence configuration is moved verbatim under the extension key. |
| `metadata.demo_video.*` | `extensions.demo_metadata` | Video / storyboard URLs. If a URL 404s at migration time, set `extensions.demo_metadata.status: deferred` rather than commit a broken link. |
| `cost_caps` | `cost_limits` | Top-level rename. Accepted under the root `additionalProperties: true`. |
| `kind: super-agent` | `category: super-agent` | Top-level rename; values are preserved (`super-agent`, `x-money-tool`, `creator-template`). |
| `kind: x-money-tool` | `category: x-money-tool` | |
| `kind: creator-template` | `category: creator-template` | |
| (x-money) `tax_disclaimer.*`, `finance.*` | `extensions.x_money_specific` | Strict tax/finance disclaimer fields migrate into the `x_money_specific` extension object. |
| (any) `launcher.ps1` reference | `runtime` block in manifest | PowerShell launchers are not migrated; the manifest's `runtime` block declares the Python entry point, and `xlos run` dispatches from that. |

## Parking convention for v2.15-only sub-blocks

The six rows above cover the v2.15 → v2.14 mappings the master plan defined.
v2.15 carries additional sub-blocks that have no master-plan-defined extension
key — for example, the source manifest's verbatim `constitution` block (with
free-form `rules:` text and Windows-specific path hints) and the source
`safety` block (with redaction, retention, and Langfuse telemetry knobs).

Rather than drop these or invent new top-level extension keys ad hoc, the
migration parks each such sub-block under `extensions.<original_key>_v215`.
The keys actually used in this migration are:

- `extensions.constitution_v215` — the verbatim source `constitution` block
  (free-form rules text, Windows path hints, telemetry stance). The mapped
  `extensions.constitution` array of article refs is the canonical v2.14 form;
  `constitution_v215` is retained for forward reference and so the Constitution
  scanner can read the source-of-truth rule text when it needs the long form.
- `extensions.safety_v215` — the verbatim source `safety` block (PII redaction,
  data retention, Langfuse public/secret env-var names, telemetry host).
  Distinct from the `constitution`-driven safety scan; this is configuration
  the runtime will consume once the safety subsystem lands.

Rationale: preserves data without polluting v2.14 validation (both sit under
`extensions.*` which is `additionalProperties: true`), keeps the Constitution
scanner able to read the long-form rule text, and gives the v2.15 RFC a clean
list of candidate keys to promote into first-class extension fields.

## Schema-level guarantees that allow this projection without modifying v2.14

The vendored `spec/v2.14/schema.json` is permissive at the relevant levels:

- Root object: `additionalProperties: true` (so `category`, `cost_limits`, and
  any unmapped fields are accepted).
- `extensions` object: `additionalProperties: true` (so unknown sub-keys do not
  fail validation), plus explicit definitions for `constitution`,
  `multi_agent_roles`, `provenance`, `demo_metadata`, and `x_money_specific`.

This is why no schema overlay was needed in Phase 3b — the v2.14 spec already
accommodates the v2.15 extension surface.

## Migration rules at install time

xlOS validates against `spec/v2.14/schema.json`. The Constitution scanner
**always** enforces the core articles — Article I (universal rules),
Article III (hard refusals), and Article VII (local-first / privacy-first
defaults) — for every manifest, regardless of what `extensions.constitution`
declares. Article III in particular forbids `bypass_safety_scanner` itself,
so the scanner cannot be opt-in. The remaining articles (II, IV, V, VI, VIII)
are scoped to features the manifest declares and run only when the manifest
opts into them via `extensions.constitution = [...]`. PowerShell launchers
are never committed; the runtime is declared in the manifest's `runtime`
block and dispatched by `xlos run`.
