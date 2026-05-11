---
title: v2.12 — pinned reference
description: Pinned reference for grok-install spec v2.12. Five YAML file types released April 2026.
---

# grok-install v2.12

!!! note "Pinned version"
    This is the **pinned** v2.12 reference. v2.12 is frozen — it still
    validates and runs exactly as shipped in April 2026.
    For the current release, see [**v2.14**](../v2.14/index.md) (adds a
    `visuals:` block).
    For the 12-standard expansion, see [**v2.13**](../v2.13/index.md).

v2.12 was the last release where the standard was **five YAML file
types**. Starting with v2.13, the standard was split into 12 focused
files.

## The five files

- **[grok-install.yaml](spec/grok-install-yaml.md)** — root manifest.
  Spec version, name, entrypoint, runtime, env vars.
- **[grok-agent.yaml](spec/grok-agent-yaml.md)** — one or more agents:
  id, model, prompt reference, tools, turn limits.
- **[grok-workflow.yaml](spec/grok-workflow-yaml.md)** — multi-agent
  orchestration. Typed steps with inputs, outputs, conditions.
- **[grok-prompts.yaml](spec/grok-prompts-yaml.md)** — system prompt
  lookup table, keyed by name.
- **[grok-security.yaml](spec/grok-security-yaml.md)** — safety profile,
  explicit permissions, approval gates, rate limits.

## Pin your spec

At the top of `grok-install.yaml`:

```yaml
spec: grok-install/v2.12
```

This locks the validator and runtime to v2.12 semantics, regardless of
what is released upstream. xlOS accepts both v2.12 and v2.14 manifests
because the vendored v2.14 schema is a superset.

## JSON schemas

The v2.12 schemas are maintained at
[`agentmindcloud/grok-yaml-standards`](https://github.com/agentmindcloud/grok-yaml-standards).

## When to stay on v2.12

- You don't need the 7 new file types from v2.13 (`grok-config`,
  `grok-analytics`, `grok-deploy`, `grok-docs`, `grok-test`,
  `grok-tools`, `grok-ui`, `grok-update`).
- You don't need the v2.14 `visuals:` block.
- Your CI, team, or downstream consumers need a frozen contract.

## Migrating off v2.12

- [v2.12 → v2.13 migration guide](../v2.13/migration-from-v2.12.md)
- [v2.13 → v2.14 migration guide](../v2.14/migration.md)

Both migrations are additive-only for the four files carried forward
(`grok-agent`, `grok-prompts`, `grok-security`, `grok-workflow`).
`grok-install.yaml` is replaced by `grok-config.yaml` in v2.13 — see
the migration guide.
