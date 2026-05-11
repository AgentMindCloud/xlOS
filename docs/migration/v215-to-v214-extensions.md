# v2.15 → v2.14 + extensions migration mapping

The legacy `grok-agent` templates were authored against an unreleased v2.15
draft. The canonical, shipped spec is v2.14 (vendored under `spec/v2.14/`).
Per DECISIONS.md D5 in `grok-install-v2`, v2.14 is permissive: unknown
top-level keys and unknown `extensions:` sub-keys are accepted.

This document records the field-by-field mapping applied during the Phase 3b
migration to bring v2.15-shaped manifests into v2.14 + extensions.

## Field mapping

| v2.15 field | v2.14 destination | Notes |
|---|---|---|
| `metadata.constitution_articles` | `extensions.constitution` | Array of article refs (e.g. `["A1", "A3"]`). |
| `multi_agent.role`, `multi_agent.roles` | `extensions.multi_agent_roles` | Verbatim copy of the multi-agent role declaration. |
| `provenance.*` | `extensions.provenance` | Citation + confidence config. |
| `metadata.demo_video.*`, `metadata.demo.*` | `extensions.demo_metadata` | Demo video / storyboard URLs. Mark `status: deferred` if URL returns 404. |
| `cost_caps` | `cost_limits` | Rename only — same shape. |
| `kind: super-agent` | top-level `category: super-agent` | Same value. |
| `kind: x-money-tool` | top-level `category: x-money-tool` | Same value. |
| `kind: creator-template` | top-level `category: creator-template` | Same value. |
| `tax_disclaimer.*` (finance only) | `extensions.x_money_specific.tax_disclaimer` | X Money / finance tools. |
| PowerShell `launcher.ps1` (finance) | top-level `runtime.entrypoint` (Python) | See `runtime` mapping below. |

## `runtime` block (xlOS dispatch contract)

`grok-install-v2` v2.14 defines `runtime.engine` and `runtime.model`. xlOS
extends this — under `extensions.runtime_dispatch` — with the dispatch type
needed by `xlos run`:

```yaml
extensions:
  runtime_dispatch:
    type: streamlit_app  # or python_module
    entrypoint: src/foo/app.py  # for streamlit_app
    module: foo.cli           # for python_module
```

xlOS `run_command` reads `extensions.runtime_dispatch` (NOT the v2.14
`runtime` block, which is the agent-engine config) and dispatches to:

- `type: streamlit_app` → `streamlit run <entrypoint>`
- `type: python_module` → `python -m <module>`
- other types → exit non-zero with `not yet implemented`.

This keeps `runtime.engine` / `runtime.model` available for the LLM-engine
config (v2.14 contract) while xlOS gets a sibling dispatch directive.

## Hard rules applied during migration

- ZERO `.ps1` files committed. PowerShell launchers converted to Python entry
  points and recorded under `extensions.runtime_dispatch`.
- ZERO demo URLs that 404. URLs that fail HEAD checks are stored with
  `status: deferred` rather than the live URL.
- ZERO modification of `spec/v2.14/schema.json` — the schema is permissive,
  and our extensions ride on `additionalProperties: true`.
- ZERO "Built for xAI, X, Grok ❤️" boilerplate copied forward.
