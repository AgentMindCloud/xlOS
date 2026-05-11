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
reads `extensions.constitution` to decide which article checks apply; agents
that do not declare `extensions.constitution` are skipped (they are not
Constitution-checked agents). PowerShell launchers are never committed; the
runtime is declared in the manifest's `runtime` block and dispatched by
`xlos run`.
