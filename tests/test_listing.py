"""Tests for ``xlos list`` (table + --json output)."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import pytest
import yaml
from click.testing import CliRunner

from xlos import runtime as runtime_module


def _install_agent(install_root: Path, name: str, manifest: dict[str, Any]) -> None:
    agent_dir = install_root / name
    agent_dir.mkdir(parents=True, exist_ok=True)
    (agent_dir / "grok-install.yaml").write_text(yaml.safe_dump(manifest), encoding="utf-8")


def _patch_user_data_dir(monkeypatch: pytest.MonkeyPatch, tmp_path: Path) -> Path:
    install_root = tmp_path / "xlos" / "agents"
    install_root.mkdir(parents=True, exist_ok=True)
    monkeypatch.setattr(
        runtime_module,
        "user_data_dir",
        lambda *_args, **_kwargs: str(tmp_path / "xlos"),
    )
    return install_root


def _manifest(name: str, version: str, category: str, targets: list[str]) -> dict[str, Any]:
    return {
        "version": version,
        "name": name,
        "description": f"Fixture manifest for {name}.",
        "runtime": {"engine": "grok", "model": "grok-4"},
        "deploy": {"targets": targets},
        "category": category,
    }


def test_list_with_no_agents_says_so(monkeypatch: pytest.MonkeyPatch, tmp_path: Path) -> None:
    _patch_user_data_dir(monkeypatch, tmp_path)
    from xlos.cli import main

    result = CliRunner().invoke(main, ["list"])
    assert result.exit_code == 0
    assert "no agents installed" in result.output


def test_list_table_contains_both_agents_with_correct_columns(
    monkeypatch: pytest.MonkeyPatch, tmp_path: Path
) -> None:
    install_root = _patch_user_data_dir(monkeypatch, tmp_path)
    _install_agent(
        install_root, "alpha", _manifest("alpha", "2.14", "creator-template", ["worker"])
    )
    _install_agent(install_root, "beta", _manifest("beta", "2.14", "super-agent", ["web", "ide"]))

    from xlos.cli import main

    result = CliRunner().invoke(main, ["list"])
    assert result.exit_code == 0
    out = result.output
    assert "alpha" in out
    assert "beta" in out
    # column headers in declared order: name | version | category | targets
    header_line = next(
        (line for line in out.splitlines() if "name" in line and "category" in line), ""
    )
    assert header_line, f"no header line in output: {out!r}"
    # Index ordering: name appears before version appears before category appears before targets.
    name_idx = header_line.find("name")
    version_idx = header_line.find("version")
    category_idx = header_line.find("category")
    targets_idx = header_line.find("targets")
    assert name_idx < version_idx < category_idx < targets_idx


def test_list_json_emits_array_of_manifests(
    monkeypatch: pytest.MonkeyPatch, tmp_path: Path
) -> None:
    install_root = _patch_user_data_dir(monkeypatch, tmp_path)
    _install_agent(
        install_root, "alpha", _manifest("alpha", "2.14", "creator-template", ["worker"])
    )
    _install_agent(install_root, "beta", _manifest("beta", "2.14", "super-agent", ["web"]))

    from xlos.cli import main

    result = CliRunner().invoke(main, ["list", "--json"])
    assert result.exit_code == 0
    payload = json.loads(result.output)
    assert isinstance(payload, list)
    names = {m["name"] for m in payload}
    assert names == {"alpha", "beta"}
    for m in payload:
        assert m["version"] == "2.14"
        assert m["deploy"]["targets"]
        assert m["category"] in ("creator-template", "super-agent")
