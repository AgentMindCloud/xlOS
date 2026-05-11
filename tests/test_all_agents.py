"""Parameterized integration test: every migrated agent must validate AND
produce zero high-severity Constitution findings.

This is the gate that proves the v2.15 -> v2.14 + extensions migration is
clean. If a new agent ever gets added under ``agents/`` and fails this, the
PR is blocked.
"""

from __future__ import annotations

from pathlib import Path
from typing import Any

import pytest
import yaml

from xlos.safety import scan_manifest
from xlos.validators import validate_manifest_v214

REPO_ROOT = Path(__file__).resolve().parent.parent
AGENTS_ROOT = REPO_ROOT / "agents"


def _all_agent_manifests() -> list[tuple[str, Path]]:
    """Return (id, path) pairs for every grok-install.yaml under agents/."""
    paths = sorted(AGENTS_ROOT.rglob("grok-install.yaml"))
    return [(p.relative_to(REPO_ROOT).as_posix(), p) for p in paths]


@pytest.mark.parametrize("agent_id,manifest_path", _all_agent_manifests())
def test_migrated_agent_validates_and_scans_clean(agent_id: str, manifest_path: Path) -> None:
    text = manifest_path.read_text(encoding="utf-8")
    data: Any = yaml.safe_load(text)
    assert isinstance(data, dict), f"manifest root not a dict: {agent_id}"

    # 1. Schema validation against vendored spec/v2.14/schema.json.
    validate_manifest_v214(data)

    # 2. Constitution scan. Every error-level finding fails the test.
    result = scan_manifest(data)
    errors = [f for f in result.findings if f.severity == "error"]
    assert not errors, f"{agent_id}: high-severity findings: " + "; ".join(
        f"{f.code} {f.message}" for f in errors
    )


def test_expected_agent_counts() -> None:
    """Master plan asserts 22 creator + 4 finance + 7 super = 33 agents."""
    creator = list((AGENTS_ROOT / "creator").glob("*/grok-install.yaml"))
    finance = list((AGENTS_ROOT / "finance").glob("*/grok-install.yaml"))
    supers = list((AGENTS_ROOT / "super-agents").glob("*/grok-install.yaml"))
    assert len(creator) == 22, f"expected 22 creator agents, got {len(creator)}"
    assert len(finance) == 4, f"expected 4 finance agents, got {len(finance)}"
    assert len(supers) == 7, f"expected 7 super-agents, got {len(supers)}"
