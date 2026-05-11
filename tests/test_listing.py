"""Tests for the list_command in xlos.runtime."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import pytest
import yaml
from click.testing import CliRunner

from xlos import runtime as runtime_module
from xlos.cli import main


def _patch_user_data_dir(monkeypatch: pytest.MonkeyPatch, tmp_path: Path) -> None:
    monkeypatch.setattr(
        runtime_module,
        "user_data_dir",
        lambda *_args, **_kwargs: str(tmp_path / "xlos"),
    )


def _write_installed(tmp_path: Path, name: str, manifest: dict[str, Any]) -> None:
    agent_dir = tmp_path / "xlos" / "agents" / name
    agent_dir.mkdir(parents=True, exist_ok=True)
    (agent_dir / "grok-install.yaml").write_text(yaml.safe_dump(manifest), encoding="utf-8")


def test_list_empty_install_dir_says_no_agents(
    monkeypatch: pytest.MonkeyPatch, tmp_path: Path
) -> None:
    _patch_user_data_dir(monkeypatch, tmp_path)
    runner = CliRunner()
    result = runner.invoke(main, ["list"])
    assert result.exit_code == 0
    assert "no agents installed" in result.output


def test_list_table_includes_columns_and_agents(
    monkeypatch: pytest.MonkeyPatch, tmp_path: Path
) -> None:
    _patch_user_data_dir(monkeypatch, tmp_path)
    _write_installed(
        tmp_path,
        "alpha",
        {
            "version": "2.14",
            "name": "alpha",
            "description": "Alpha agent.",
            "runtime": {"engine": "grok", "model": "grok-4"},
            "deploy": {"targets": ["ide"]},
            "category": "creator-template",
        },
    )
    _write_installed(
        tmp_path,
        "bravo",
        {
            "version": "2.14",
            "name": "bravo",
            "description": "Bravo agent.",
            "runtime": {"engine": "grok", "model": "grok-4"},
            "deploy": {"targets": ["web"]},
            "category": "x-money-tool",
        },
    )
    runner = CliRunner()
    result = runner.invoke(main, ["list"])
    assert result.exit_code == 0, result.output
    # Column headers
    for col in ("name", "version", "category", "targets"):
        assert col in result.output, f"missing column {col!r} in:\n{result.output}"
    # Both agents present
    assert "alpha" in result.output
    assert "bravo" in result.output
    # The column-order contract: name appears before version which appears
    # before category which appears before targets.
    name_pos = result.output.index("name")
    version_pos = result.output.index("version")
    category_pos = result.output.index("category")
    targets_pos = result.output.index("targets")
    assert name_pos < version_pos < category_pos < targets_pos


def test_list_json_emits_full_manifests(monkeypatch: pytest.MonkeyPatch, tmp_path: Path) -> None:
    _patch_user_data_dir(monkeypatch, tmp_path)
    a_manifest = {
        "version": "2.14",
        "name": "alpha",
        "description": "Alpha agent.",
        "runtime": {"engine": "grok", "model": "grok-4"},
        "deploy": {"targets": ["ide"]},
        "category": "creator-template",
    }
    b_manifest = {
        "version": "2.14",
        "name": "bravo",
        "description": "Bravo agent.",
        "runtime": {"engine": "grok", "model": "grok-4"},
        "deploy": {"targets": ["web"]},
        "category": "x-money-tool",
    }
    _write_installed(tmp_path, "alpha", a_manifest)
    _write_installed(tmp_path, "bravo", b_manifest)

    runner = CliRunner()
    result = runner.invoke(main, ["list", "--json"])
    assert result.exit_code == 0, result.output
    payload = json.loads(result.output)
    assert isinstance(payload, list)
    names = sorted(m["name"] for m in payload)
    assert names == ["alpha", "bravo"]
    # Verify full manifest content survives (not just the table-displayed cols)
    by_name = {m["name"]: m for m in payload}
    assert by_name["alpha"]["description"] == "Alpha agent."
    assert by_name["bravo"]["deploy"]["targets"] == ["web"]
