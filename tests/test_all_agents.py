"""Parameterized tests for every migrated agent under agents/."""

from __future__ import annotations

from pathlib import Path
from typing import Iterable

import pytest
import yaml

from xlos.safety import scan_manifest
from xlos.validators import validate_manifest_v214

REPO_ROOT = Path(__file__).resolve().parent.parent
AGENTS_DIR = REPO_ROOT / "agents"


def _all_manifests() -> list[Path]:
    if not AGENTS_DIR.exists():
        return []
    return sorted(AGENTS_DIR.rglob("grok-install.yaml"))


def _ids(paths: Iterable[Path]) -> list[str]:
    return [str(p.relative_to(REPO_ROOT)) for p in paths]


@pytest.mark.parametrize("manifest_path", _all_manifests(), ids=_ids(_all_manifests()))
def test_agent_validates_and_scans_clean(manifest_path: Path) -> None:
    data = yaml.safe_load(manifest_path.read_text(encoding="utf-8"))
    assert isinstance(data, dict), f"{manifest_path}: manifest root must be a mapping"

    # Schema validation
    validate_manifest_v214(data)

    # Constitution scan must produce zero high-severity findings
    result = scan_manifest(data)
    errors = [f for f in result.findings if f.severity == "error"]
    assert not errors, f"{manifest_path}: Constitution errors:\n" + "\n".join(
        f.to_line() for f in errors
    )


def test_total_migrated_agent_count() -> None:
    manifests = _all_manifests()
    by_category = {"creator": 0, "finance": 0, "super-agents": 0}
    for m in manifests:
        for cat in by_category:
            if f"agents/{cat}/" in str(m.relative_to(REPO_ROOT)):
                by_category[cat] += 1
                break
    assert by_category["creator"] == 22, by_category
    assert by_category["finance"] == 4, by_category
    assert by_category["super-agents"] == 7, by_category
    assert len(manifests) == 33, manifests
