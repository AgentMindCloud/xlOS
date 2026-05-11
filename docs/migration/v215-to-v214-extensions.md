# v2.15 -> v2.14 + extensions field mapping

This document captures the field-by-field mapping used by xlOS to ingest agent
manifests authored against the (unshipped) v2.15 draft from `grok-agent` and
write them out under the canonical v2.14 schema vendored from
`grok-install-v2`. The destination shape uses v2.14's open `extensions:` block
(see `spec/v2.14/extensions/README.md`) to preserve every v2.15 affordance
without divergence from the upstream specification.

## Authority

- v2.14 (canonical): vendored at `spec/v2.14/schema.json`. Source of truth:
  `AgentMindCloud/grok-install-v2`.
- v2.15 (draft, not yet vendored): structures observed in
  `AgentMindCloud/grok-agent/templates/**/grok-install.yaml`.
- The mapping is one-way: ingestion only. xlOS never emits v2.15.

## Mapping table

| v2.15 source field                  | v2.14 destination field                  | Notes                                                                                  |
|-------------------------------------|------------------------------------------|----------------------------------------------------------------------------------------|
| `metadata.constitution_articles`    | `extensions.constitution`                | Array of article refs (e.g. `["A1", "A3"]`).                                           |
| `multi_agent.role`                  | `extensions.multi_agent_roles`           | Sub-agent role declarations.                                                           |
| `provenance.*`                      | `extensions.provenance`                  | Citation / confidence configuration; flattened sub-tree under `extensions.provenance`. |
| `metadata.demo_video.*`             | `extensions.demo_metadata`               | Demo URL + storyboard; mark `status: deferred` when the URL 404s.                      |
| `cost_caps`                         | `cost_limits`                            | Renamed; v2.14 prefers `cost_limits`.                                                  |
| `kind: super-agent`                 | `category: super-agent`                  | Top-level category enum (accepted via `additionalProperties: true`).                   |
| `kind: x-money-tool`                | `category: x-money-tool`                 | Same.                                                                                  |
| `kind: creator-template`            | `category: creator-template`             | Same.                                                                                  |
| `x_money.*` / tax disclaimer fields | `extensions.x_money_specific`            | Cost caps + tax disclaimer for finance / X Money templates.                            |

## Boilerplate stripped on ingest

Per master plan Phase 3b hard rules, the following are stripped — never
carried into xlOS-vendored manifests or READMEs:

- `Built for xAI`, `Built for X`, `Built for Grok`, or trailing heart
  decorations.
- HANDOFF / MERGE_PLAN / AUDIT-REPORT artifacts.

## Unmappable fields

If a v2.15 manifest contains fields outside this table:

1. If the field is informational (description, label), preserve under
   `extensions.<namespace>` to retain provenance.
2. If the field is structural (deploy target, runtime engine) and the v2.14
   schema rejects it, drop with a YAML `#` comment in the migrated file and
   record the action in the verification report.

## Validation contract

Every migrated manifest MUST validate against `spec/v2.14/schema.json` via
`xlos.validators.validate_manifest_v214`. The CI workflow `validate.yml`
re-runs this contract on every pushed change.
