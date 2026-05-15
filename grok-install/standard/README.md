# The grok-install.yaml standard (v2.14)

This page presents the standard xlOS speaks. The **canonical schema is not
duplicated here** — it is vendored read-only at
[`../../spec/v2.14/schema.json`](../../spec/v2.14/schema.json) with its
provenance recorded in [`../../spec/v2.14/VENDOR.md`](../../spec/v2.14/VENDOR.md).
Referencing rather than copying keeps a single source of truth and preserves
the vendor provenance chain.

## Required fields

| Field | Type | Notes |
|---|---|---|
| `version` | const `"2.14"` | Locked. |
| `name` | slug | lowercase, hyphenated, 2–63 chars. |
| `description` | string | 10–500 chars, human-readable. |
| `runtime` | object | `{ engine: grok, model: <id> }`. |
| `deploy` | object | `{ targets: [action\|ide\|worker\|web] }`. |

The root and the `extensions` object are `additionalProperties: true`, so
`category`, `cost_limits`, and the whole `extensions:` surface validate
without a schema overlay.

## The extensions block

xlOS adds an optional `extensions:` block for richer agents:

- `tier` — `light` | `heavy` (see [Heavy vs Light](../README.md#heavy-vs-light)).
- `constitution` — array of Constitution article refs the agent opts into
  (Articles I, III, VII are always enforced regardless).
- `runtime_dispatch` — Heavy only: `{ type: python_module, module: <pkg> }`;
  `xlos run` dispatches from this.
- `multi_agent_roles`, `provenance`, `demo_metadata`, `x_money_specific` —
  as defined in [`../../spec/v2.14/extensions/README.md`](../../spec/v2.14/extensions/README.md).

## Normalizing legacy (v2.15) manifests

grok-agent's internal working draft was v2.15. The authoritative projection
into v2.14 + extensions is documented at
[`../../docs/migration/v215-to-v214-extensions.md`](../../docs/migration/v215-to-v214-extensions.md).
Use it when recovering a legacy agent — it is the normalization spec.
