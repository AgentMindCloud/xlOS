"""Guards the Living Narrative Fabric recovery.

These tests fail loudly if the agent ever regresses to a hollow manifest:
the manifests must validate and pass the Constitution scan, the real
implementation must be present, and it must run end-to-end offline.
"""

from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path

import pytest
import yaml

from xlos.safety import scan_manifest
from xlos.validators import validate_manifest_v214

REPO = Path(__file__).resolve().parent.parent
AGENT = REPO / "agents" / "super-agents" / "living-narrative-fabric"


@pytest.mark.parametrize("manifest", ["grok-install.yaml", "grok-install.light.yaml"])
def test_lnf_manifests_validate_and_pass_constitution(manifest: str) -> None:
    data = yaml.safe_load((AGENT / manifest).read_text(encoding="utf-8"))
    validate_manifest_v214(data)
    assert not scan_manifest(data).has_errors


def test_lnf_real_implementation_is_present() -> None:
    impl = AGENT / "impl"
    assert (impl / "orchestrator.py").is_file()
    assert (impl / "graph.py").is_file()
    py_lines = sum(len(p.read_text(encoding="utf-8").splitlines()) for p in impl.rglob("*.py"))
    # The recovered orchestrator suite is ~11k LOC; assert it is not a stub.
    assert py_lines > 5000, f"impl looks hollow ({py_lines} LOC)"


def test_lnf_light_prompt_is_self_contained() -> None:
    prompt = (AGENT / "light" / "prompt.md").read_text(encoding="utf-8")
    assert "never silently" in prompt.lower() or "without ever silently" in prompt.lower()
    # Light must be honest about not having Heavy's state.
    assert "single-shot" in prompt.lower()


def test_lnf_runs_offline_end_to_end() -> None:
    impl = AGENT / "impl"
    result = subprocess.run(
        [sys.executable, "-m", "orchestrator", "--topic", "test recovery", "--time-range", "7d"],
        cwd=str(impl),
        env={**os.environ, "PYTHONPATH": str(impl)},
        capture_output=True,
        text=True,
        timeout=120,
    )
    assert result.returncode == 0, result.stderr[-1500:]
    out = result.stdout
    assert "Synthesis" in out and "Contradictions" in out and "Bridges" in out
