#!/usr/bin/env python3
"""Generate repo-map.json + REPO_MAP.md — the navigability aid & honesty ledger.

repo-map.json is a machine-readable map of the repository for humans and for
agents (e.g. Grok) operating on xlOS. It is also the honesty ledger: an agent
is only ``available`` when a real implementation is present (a non-empty
``impl/`` package, or a Light ``light/prompt.md`` the agent genuinely is);
everything else is ``spec``.

Run from the repo root:  python scripts/build_repo_map.py
"""

from __future__ import annotations

import json
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent
AGENTS = ROOT / "agents"

SECTIONS = {
    "grok-install/": "Agent install standard: standard, validator, templates, mint flow.",
    "agents/": "The agent library (creator-x-co-pilot, super-agents, creator, finance).",
    "src/xlos/": "The cross-platform Python runtime: CLI, install, run, validators, safety.",
    "spec/v2.14/": "Vendored read-only v2.14 schema (source of truth; see VENDOR.md).",
    "packages/grok_paradoxes/": "Standalone tested package; Living Narrative Fabric builds on it.",
    "tools/": "X-native creator tools (single-file HTML + one hybrid).",
    "marketplace/": "Next.js 15 discovery surface (status-driven, honest).",
    "extensions/browser/": "Manifest v3 browser extension (one-click install from X).",
    "docs/": "CLI reference, authoring guide, v2.15->v2.14 migration mapping, Constitution.",
}


def _status(agent_dir: Path) -> str:
    impl = agent_dir / "impl"
    if impl.is_dir() and any(p.suffix == ".py" or p.is_dir() for p in impl.iterdir()):
        return "available"
    if (agent_dir / "light" / "prompt.md").is_file():
        return "available"
    return "spec"


def _tier(manifest: dict, agent_dir: Path) -> str:
    ext = manifest.get("extensions") or {}
    tier = ext.get("tier")
    if tier in ("light", "heavy"):
        return tier
    if (agent_dir / "light" / "prompt.md").is_file():
        return "light"
    if isinstance(ext.get("runtime_dispatch"), dict):
        return "heavy"
    return "undeclared"


def main() -> int:
    agents: list[dict] = []
    if AGENTS.is_dir():
        for section in sorted(p for p in AGENTS.iterdir() if p.is_dir()):
            for agent_dir in sorted(p for p in section.iterdir() if p.is_dir()):
                manifest_path = agent_dir / "grok-install.yaml"
                if not manifest_path.is_file():
                    continue
                data = yaml.safe_load(manifest_path.read_text(encoding="utf-8"))
                if not isinstance(data, dict):
                    continue
                name = str(data.get("name") or agent_dir.name)
                status = _status(agent_dir)
                tier = _tier(data, agent_dir)
                agents.append(
                    {
                        "name": name,
                        "section": section.name,
                        "category": data.get("category", ""),
                        "tier": tier,
                        "status": status,
                        "path": str(agent_dir.relative_to(ROOT)),
                        "run": (
                            f"xlos run {name}"
                            if status == "available" and tier == "heavy"
                            else (
                                f"{agent_dir.relative_to(ROOT)}/light/prompt.md"
                                if tier == "light"
                                else "—"
                            )
                        ),
                    }
                )

    avail = sum(1 for a in agents if a["status"] == "available")
    repo_map = {
        "repo": "AgentMindCloud/xlOS",
        "generated_by": "scripts/build_repo_map.py",
        "summary": {
            "agents_total": len(agents),
            "available": avail,
            "spec": len(agents) - avail,
        },
        "sections": SECTIONS,
        "agents": agents,
    }
    (ROOT / "repo-map.json").write_text(json.dumps(repo_map, indent=2) + "\n", encoding="utf-8")

    lines = [
        "# Repo Map",
        "",
        "Machine-readable source: [`repo-map.json`](repo-map.json). This is the "
        "honesty ledger — `available` means it runs end-to-end with passing "
        "tests; `spec` means manifest-only (implementation being rebuilt).",
        "",
        f"**{len(agents)} agents** — {avail} available, {len(agents) - avail} spec.",
        "",
        "## Sections",
        "",
    ]
    for path, desc in SECTIONS.items():
        lines.append(f"- `{path}` — {desc}")
    lines += [
        "",
        "## Agents",
        "",
        "| Agent | Section | Tier | Status | Run |",
        "|---|---|---|---|---|",
    ]
    for a in agents:
        lines.append(
            f"| {a['name']} | {a['section']} | {a['tier']} | {a['status']} | `{a['run']}` |"
        )
    (ROOT / "REPO_MAP.md").write_text("\n".join(lines) + "\n", encoding="utf-8")

    print(f"repo-map: {len(agents)} agents ({avail} available, {len(agents)-avail} spec)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
