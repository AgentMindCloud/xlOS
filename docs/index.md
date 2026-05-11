---
title: xlOS — cross-platform developer runtime for Grok agents on X
description: xlOS is the open-source Python runtime that installs, validates, and runs Grok agents on Mac, Linux, and Windows. Bundled marketplace, Constitution safety scanner, and 33 production agents.
---

# xlOS

xlOS is the cross-platform developer runtime for Grok agents on X.

It speaks the `grok-install.yaml` v2.14 standard, runs identically on
Mac, Linux, and Windows, and ships with **33 production agents**, a
**Constitution-checked safety scanner** (24 named checks across 8
articles), a **bundled marketplace**, and a **browser extension** for
one-click install from any X post.

## Quickstart

```bash
pip install xlos
xlos install agents/super-agents/living-narrative-fabric/grok-install.yaml
xlos run living-narrative-fabric
```

Works identically on Mac, Linux, Windows. See
[Install the CLI](getting-started/installation.md) for the full setup.

## What's in this repo

- **`xlos` CLI** — `install`, `run`, `list`, `doctor`. Same surface on every OS.
- **33 production agents** — 7 super-agents, 4 X Money tools, 22 creator templates.
- **Constitution safety scanner** — 24 named checks across 8 articles.
- **X-native tools** — 5 shipping (4 single-file HTML + 1 hybrid) plus 7 specified for future builds.
- **Marketplace** — Next.js 15 discovery surface.
- **Browser extension** — Manifest v3, one-click install from any X post.
- **`grok-paradoxes`** — standalone Python package for contradiction detection.

## Where to go next

- **[Getting started](getting-started/index.md)** — three pages, start to finish.
- **[CLI reference](cli/reference.md)** — every command and flag.
- **[Constitution](constitution/index.md)** — the 8 articles xlOS enforces.
- **[v2.14 spec](v2.14/index.md)** — the current standard, including the
  optional `visuals:` block.
- **[v2.13 spec](v2.13/index.md)** — the 12-standard expansion.
- **[v2.12 spec](v2.12/index.md)** — the pinned five-file reference.
- **[Ecosystem](ecosystem/index.md)** — xAI SDK, LiteLLM, Semantic Kernel.

## The standard

xlOS implements the open `grok-install.yaml` standard, maintained at
[AgentMindCloud/grok-install](https://github.com/AgentMindCloud/grok-install).
xlOS adds the optional `extensions:` block for richer agents
(Constitution articles, multi-agent roles, provenance, demo metadata).

See [migration/v215-to-v214-extensions](migration/v215-to-v214-extensions.md)
for the field-by-field mapping.

## License

Apache 2.0. See [LICENSE](https://github.com/AgentMindCloud/xlOS/blob/main/LICENSE).
