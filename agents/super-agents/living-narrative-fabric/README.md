# Living Narrative Fabric

Versioned, provenance-first synthesis across X, news, academia, government,
and the open web — with contradiction detection that **never silently picks a
winner**. The reference super-agent of xlOS.

## Status

**Available.** This agent has a real implementation (`impl/`, ~11k LOC
recovered at full fidelity) and runs end-to-end **offline and deterministically**
with no API keys (stub connectors) — guarded by `tests/test_lnf_recovery.py`.

| Tier | How to run | What you get |
|---|---|---|
| **Heavy** | `xlos install agents/super-agents/living-narrative-fabric/grok-install.yaml` then `xlos run living-narrative-fabric` | Full local orchestrator (Mastra → LangGraph → pure-Python fallback), versioned/rewindable synthesis, append-only provenance, optional Mem0/Qdrant memory and eval loop. |
| **Light** | Paste [`light/prompt.md`](light/prompt.md) into Grok on X. Zero install. | Single-shot cited synthesis with the same dual-surface contradiction rule. No persistent memory or provenance log — honest by design. |

## Honesty notes

- `xlos run` works today with **only xlOS's own dependencies** — the
  orchestrator falls through to a pure-Python in-process path when LangGraph,
  Mem0, connectors, and network are all absent.
- Live connectors (NewsAPI, GNews, Semantic Scholar, data.gov, X/Grok,
  Crawl4AI) are **opt-in** via environment variables; without them the agent
  uses deterministic seeded stubs and says so.
- The demo video is `status: deferred` in the manifest — no URL is claimed
  until it is actually recorded.
- `impl/grok-agent.v215.reference.yaml` is the original legacy v2.15 manifest,
  kept for provenance only. The active manifest is the normalized v2.14
  `grok-install.yaml` (+ `extensions:`), per
  [`docs/migration/v215-to-v214-extensions.md`](../../../docs/migration/v215-to-v214-extensions.md).
