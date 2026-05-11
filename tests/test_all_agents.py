"""Parameterized test that walks every migrated agent manifest.

Each agent's grok-install.yaml must:
  1. parse as YAML mapping
  2. pass v2.14 schema validation
  3. produce no high-severity findings from the Constitution scanner

The final agent count is asserted explicitly so a regressed migration
(missing slug, accidentally added slug) trips this test, not just CI lint.
"""

from __future__ import annotations

from pathlib import Path

import pytest
import yaml

from xlos.safety import scan_manifest
from xlos.validators import validate_manifest_v214

REPO_ROOT = Path(__file__).resolve().parent.parent
AGENTS_DIR = REPO_ROOT / "agents"


def _all_manifest_paths() -> list[Path]:
    if not AGENTS_DIR.is_dir():
        return []
    return sorted(AGENTS_DIR.rglob("grok-install.yaml"))


def test_total_agent_count() -> None:
    paths = _all_manifest_paths()
    # Master plan Phase 3b: 22 creator + 4 finance + 7 super = 33.
    assert len(paths) == 33, f"expected 33 migrated agents, got {len(paths)}"


@pytest.mark.parametrize("manifest_path", _all_manifest_paths(), ids=lambda p: p.parent.name)
def test_agent_validates_and_passes_scanner(manifest_path: Path) -> None:
    text = manifest_path.read_text(encoding="utf-8")
    data = yaml.safe_load(text)
    assert isinstance(data, dict), f"{manifest_path} did not parse to a mapping"
    validate_manifest_v214(data)
    result = scan_manifest(data)
    high = [f for f in result.findings if f.severity == "error"]
    assert not high, f"{manifest_path.parent.name}: high-severity findings: " + "; ".join(
        f"[{f.article}] {f.code}: {f.message}" for f in high
    )


def test_categories_present() -> None:
    """Each migrated agent declares a v2.14 + extensions `category`."""
    paths = _all_manifest_paths()
    categories: dict[str, int] = {}
    for p in paths:
        data = yaml.safe_load(p.read_text(encoding="utf-8"))
        cat = data.get("category") if isinstance(data, dict) else None
        if cat:
            categories[cat] = categories.get(cat, 0) + 1
    assert categories.get("creator-template", 0) == 22
    assert categories.get("x-money-tool", 0) == 4
    assert categories.get("super-agent", 0) == 7
