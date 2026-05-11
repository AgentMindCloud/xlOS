---
title: Spec overview
description: The grok-install YAML specification — five file types, one standard, v2.12.
---

# Spec overview

The `grok-install` standard is five YAML files working together. A repo only
needs `grok-install.yaml` at the root; everything else lives under `.grok/`.

```
my-agent/
├── grok-install.yaml          # (required) root manifest
└── .grok/
    ├── grok-agent.yaml        # agent definitions
    ├── grok-workflow.yaml     # (optional) multi-agent orchestration
    ├── grok-prompts.yaml      # named system prompts
    └── grok-security.yaml     # safety profile, permissions, limits
```

## The five files

- **[grok-install.yaml](grok-install-yaml.md)** — the one required
  file. Declares the spec version, name, entrypoint, runtime, and
  environment variables.
- **[grok-agent.yaml](grok-agent-yaml.md)** — defines one or more
  agents: id, model, prompt reference, available tools, turn limits.
- **[grok-workflow.yaml](grok-workflow-yaml.md)** — for swarms. A
  sequence of typed steps that chain agents together with inputs,
  outputs, and conditions.
- **[grok-prompts.yaml](grok-prompts-yaml.md)** — system prompts
  lookup table. Agents reference prompts by key via `prompt_ref`.
- **[grok-security.yaml](grok-security-yaml.md)** — safety profile,
  explicit permissions, approval gates, and rate limits enforced by
  the runtime.

## Version matrix

| Spec version | Released    | Notable changes                              |
| ------------ | ----------- | -------------------------------------------- |
| **v2.12**    | Apr 2026    | Passive Growth Engine, voice controls        |
| v2.10        | Mar 2026    | Verified-by-Grok badge, minimum-keys-only    |
| v2.4         | Feb 2026    | Orchestration + triggers                     |
| v2.0         | Jan 2026    | Multi-LLM providers                          |
| v1.0         | Dec 2025    | Initial standard                             |

!!! tip "Pin your spec version"
    Declare it explicitly at the top of `grok-install.yaml`:
    ```yaml
    spec: grok-install/v2.12
    ```
    This locks the validator and runtime behavior, so upstream changes
    can't silently break your agent.

## JSON schemas

Each file has a JSON Schema maintained at
[`agentmindcloud/grok-yaml-standards`](https://github.com/agentmindcloud/grok-yaml-standards).
xlOS vendors the v2.14 schema (superset of v2.12 plus the `visuals:`
block) under `spec/v2.14/schema.json`. v2.12 manifests still validate
against the vendored schema because v2.14 is fully backwards
compatible.
