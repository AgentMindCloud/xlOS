---
title: Your first agent (10 min)
description: Install and run a bundled xlOS agent in ten minutes. Copy-paste friendly.
---

# Your first agent

Estimated time: **10 minutes**. You'll have a working agent running
locally when you're done.

## What you'll do

Install one of the 33 production agents bundled with the xlOS repo,
inspect its manifest, and run it locally. This is the same flow your
users will follow when they install from any GitHub repo.

## Step 1 — Clone the repo

```bash
git clone https://github.com/AgentMindCloud/xlOS
cd xlOS
```

The bundled agents live under three directories:

- `agents/super-agents/` — 7 multi-agent orchestrations with provenance.
- `agents/finance/` — 4 X Money tools (finance, tax, payout, alpha).
- `agents/creator/` — 22 creator templates.

Browse the [marketplace](https://github.com/AgentMindCloud/xlOS/tree/main/marketplace)
for a curated view.

## Step 2 — Install a bundled agent

```bash
xlos install agents/super-agents/living-narrative-fabric/grok-install.yaml
```

This:

1. Validates the manifest against `spec/v2.14/schema.json`.
2. Runs the Constitution scanner (24 named checks across 8 articles).
3. Copies the agent into xlOS's local registry under your user data
   directory.

## Step 3 — Inspect the manifest

Open `agents/super-agents/living-narrative-fabric/grok-install.yaml`.
You'll see the standard v2.14 shape plus the xlOS-specific
`extensions:` block. The extensions carry the Constitution articles the
agent opts into, multi-agent role declarations, provenance settings,
and demo metadata.

See [v2.14 spec](../v2.14/index.md) for the standard fields and
[v2.15 → v2.14 + extensions migration](../migration/v215-to-v214-extensions.md)
for the field-by-field mapping of the extensions surface.

## Step 4 — Run it

```bash
xlos run living-narrative-fabric
```

The agent boots in the runtime declared in its manifest and drops you
into an interactive session.

## Step 5 — List what's installed

```bash
xlos list
```

`--json` emits a machine-readable manifest.

## Step 6 — Diagnose

If anything's off:

```bash
xlos doctor
```

Reports Python version, install path, schema integrity, scanner state,
and the Constitution articles each registered agent has opted into.

## Step 7 — Try another

```bash
xlos install agents/creator/x-engagement-coach/grok-install.yaml
xlos run x-engagement-coach
```

Repeat with any of the 33 bundled agents to get a feel for the
breadth.

## Step 8 — Author your own

To build your own agent, start from the v2.14 spec and the
[`grok-install` standards](../v2.12/spec/grok-install-yaml.md):

```
my-agent/
├── grok-install.yaml          # root manifest
└── .grok/
    ├── grok-agent.yaml        # agent definitions
    ├── grok-prompts.yaml      # named system prompts
    └── grok-security.yaml     # safety profile, permissions
```

See the [Tool schemas](../guides/tool-schemas.md) and
[Safety profiles](../guides/safety-profiles.md) guides for the
authoring details, and [Multi-agent swarms](../guides/multi-agent-swarms.md)
when one agent isn't enough.

## Where next

- **[Deploy it](deploy.md)** — Vercel, Railway, Docker, Replit.
- **[CLI reference](../cli/reference.md)** — every command and flag.
- **[Constitution](../constitution/index.md)** — what the scanner enforces.
