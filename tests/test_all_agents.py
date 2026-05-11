"""End-to-end agent validation: every migrated agent must validate against
the v2.14 schema and produce zero high-severity scanner findings."""

from __future__ import annotations

from pathlib import Path

import pytest
import yaml

from xlos.safety.scanner import scan_manifest
from xlos.validators import validate_manifest_v214

REPO_ROOT = Path(__file__).resolve().parent.parent
AGENTS_DIR = REPO_ROOT / "agents"


def _discover_manifests() -> list[Path]:
    if not AGENTS_DIR.is_dir():
        return []
    return sorted(AGENTS_DIR.rglob("grok-install.yaml"))


MANIFESTS = _discover_manifests()


def test_migrated_agent_count_at_least_33() -> None:
    """Master plan asserts 22 creator + 4 finance + 7 super-agents = 33."""
    assert (
        len(MANIFESTS) >= 33
    ), f"expected >= 33 migrated agents, found {len(MANIFESTS)}: {MANIFESTS}"


@pytest.mark.parametrize("manifest_path", MANIFESTS, ids=lambda p: p.parent.name)
def test_agent_validates_against_v214_schema(manifest_path: Path) -> None:
    data = yaml.safe_load(manifest_path.read_text(encoding="utf-8"))
    assert isinstance(data, dict), f"{manifest_path} is not a YAML mapping"
    validate_manifest_v214(data)


@pytest.mark.parametrize("manifest_path", MANIFESTS, ids=lambda p: p.parent.name)
def test_agent_passes_constitution_scan(manifest_path: Path) -> None:
    data = yaml.safe_load(manifest_path.read_text(encoding="utf-8"))
    assert isinstance(data, dict)
    result = scan_manifest(data)
    errors = [f for f in result.findings if f.severity == "error"]
    assert not errors, f"{manifest_path} produced {len(errors)} Constitution errors: " + ", ".join(
        e.code for e in errors
    )


@pytest.mark.parametrize("manifest_path", MANIFESTS, ids=lambda p: p.parent.name)
def test_agent_carries_no_built_for_xai_boilerplate(manifest_path: Path) -> None:
    """Hard rule: zero 'Built for xAI, X, Grok ❤️' boilerplate."""
    text = manifest_path.read_text(encoding="utf-8")
    forbidden = "Built for xAI, X, Grok"
    assert forbidden not in text, f"{manifest_path} still carries forbidden boilerplate"
