# xlOS
> Cross-platform developer runtime for Grok agents on X. Mac, Linux, Windows.

![xlOS](assets/banner.svg)

## What is this

xlOS is the open-source Python runtime that installs, validates, and runs
Grok agents the same way on Mac, Linux, and Windows. It speaks the
`grok-install.yaml` **v2.14** standard, ships a Constitution-checked safety
scanner, a bundled Next.js marketplace, and a browser extension for one-click
install from any X post.

xlOS is in **active development toward v1.0**. The runtime, validator, safety
scanner, marketplace, and extension are real and working today. The **agent
library is being rebuilt for quality** — see *Current Status* below.

## Quickstart (60 seconds)

```bash
git clone https://github.com/AgentMindCloud/xlOS.git
cd xlOS
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -e .

xlos doctor                                          # environment diagnostics
xlos install agents/super-agents/living-narrative-fabric/grok-install.yaml
xlos list                                            # show installed agents
```

`xlos doctor`, `install` (validate + Constitution-scan + register), and
`list` work today on Mac, Linux, and Windows. `xlos run <agent>` executes an
agent's implementation and is **rolling out with the agent rebuild — Living
Narrative Fabric first** (see Roadmap).

## Current Status

xlOS is confident about what it is and honest about what it isn't yet.

**Working today**

- `xlos` CLI — `doctor`, `install` (schema-validated + Constitution-scanned),
  `list` — cross-platform.
- **Constitution safety scanner** — 24 named checks across 8 articles;
  Articles I, III, VII enforced unconditionally.
- **v2.14 standard** — vendored schema under `spec/v2.14/`, surfaced via the
  `grok-install/` section (standard + validator + templates + mint flow).
- **Marketplace** — Next.js 15 discovery surface.
- **Browser extension** — Manifest v3, one-click install from an X post.
- **grok-paradoxes** — standalone, tested Python package for contradiction
  detection (the core that Living Narrative Fabric is rebuilt on top of).
- **X-native tools** under `tools/` — 5 shipping, 7 specified.

**Being rebuilt for quality**

- The agent library currently ships **33 agent specifications**
  (`grok-install.yaml` manifests under `agents/`). Full implementations are
  being recovered at high fidelity and wired so `xlos run` genuinely works.
  An agent is only labelled **available** once its manifest validates, it runs
  end-to-end, its tests pass, and its docs match reality.

## v1.0 Roadmap

1. **Honesty + structure** *(in progress)* — accurate docs; clean
   professional layout; `grok-install/` section; machine-readable repo map.
2. **Living Narrative Fabric** — first super-agent recovered end-to-end on
   `grok-paradoxes`, in **Heavy** (full local stack) and **Light**
   (no-install, in-chat) tiers.
3. **Creator X Co-Pilot** — the flagship hero experience, Light-first.
4. **Self-Evolving Personal OS** and the strongest creator templates,
   recovered at full fidelity.
5. **v1.0** — a content-rich, professional release where every public claim
   is backed by something that runs.

## Heavy vs Light

- **Light** — zero install. Runs in-chat on Grok/X. The default experience
  for most creators.
- **Heavy** — the full local `xlos` stack: orchestrator, persistent memory,
  append-only provenance, evaluation loop. For power users and teams.

## The standard

Speaks `grok-install.yaml` v2.14. The canonical schema is maintained upstream
at [AgentMindCloud/grok-install](https://github.com/AgentMindCloud/grok-install)
and vendored read-only under `spec/v2.14/`. The in-repo `grok-install/`
section presents the standard, a validator, starter templates, and the hosted
mint flow. xlOS adds the optional `extensions:` block for richer agents
(Constitution articles, multi-agent roles, provenance, demo metadata, tier).

## Cross-platform support

| OS | CLI | Marketplace | Tools |
|---|---|---|---|
| Windows | ✓ tested in CI | ✓ browser | ✓ browser |
| macOS | ✓ tested in CI | ✓ browser | ✓ browser |
| Linux | ✓ tested in CI | ✓ browser | ✓ browser |
| iOS | browser only | ✓ browser | ✓ browser |
| Android | browser only | ✓ browser | ✓ browser |

## Docs

See [docs/](docs/) for the CLI reference, agent authoring guide, schema
reference, the v2.15→v2.14 migration mapping, and Constitution articles.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

Apache 2.0.
