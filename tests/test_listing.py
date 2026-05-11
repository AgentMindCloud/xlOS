"""Tests for ``xlos.runtime.list_command``."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import pytest
import yaml
from click.testing import CliRunner

from xlos import runtime as runtime_module


def _patch_user_data_dir(monkeypatch: pytest.MonkeyPatch, tmp_path: Path) -> None:
    monkeypatch.setattr(
        runtime_module,
        "user_data_dir",
        lambda *_args, **_kwargs: str(tmp_path / "xlos"),
    )


def _write_manifest(tmp_path: Path, slug: str, manifest: dict[str, Any]) -> None:
    target = tmp_path / "xlos" / "agents" / slug / "grok-install.yaml"
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(yaml.safe_dump(manifest), encoding="utf-8")


def test_list_empty_install_dir_emits_message(
    monkeypatch: pytest.MonkeyPatch, tmp_path: Path
) -> None:
    _patch_user_data_dir(monkeypatch, tmp_path)
    from xlos.cli import main

    runner = CliRunner()
    result = runner.invoke(main, ["list"])
    assert result.exit_code == 0
    assert "no agents installed" in result.output


def test_list_with_two_agents_shows_both_in_table(
    monkeypatch: pytest.MonkeyPatch, tmp_path: Path
) -> None:
    _patch_user_data_dir(monkeypatch, tmp_path)
    _write_manifest(
        tmp_path,
        "alpha",
        {
            "version": "2.14",
            "name": "alpha",
            "description": "First test agent for the listing tests.",
            "runtime": {"engine": "grok", "model": "grok-4"},
            "deploy": {"targets": ["ide"]},
            "category": "creator-template",
        },
    )
    _write_manifest(
        tmp_path,
        "bravo",
        {
            "version": "2.14",
            "name": "bravo",
            "description": "Second test agent for the listing tests.",
            "runtime": {"engine": "grok", "model": "grok-4"},
            "deploy": {"targets": ["ide", "action"]},
            "category": "x-money-tool",
        },
    )
    from xlos.cli import main

    runner = CliRunner()
    result = runner.invoke(main, ["list"])
    assert result.exit_code == 0, result.output
    assert "alpha" in result.output
    assert "bravo" in result.output
    # Column-order contract: name | version | category | targets
    idx_name = result.output.index("name")
    idx_version = result.output.index("version")
    idx_category = result.output.index("category")
    idx_targets = result.output.index("targets")
    assert idx_name < idx_version < idx_category < idx_targets


def test_list_json_emits_full_manifest_array(
    monkeypatch: pytest.MonkeyPatch, tmp_path: Path
) -> None:
    _patch_user_data_dir(monkeypatch, tmp_path)
    a_manifest = {
        "version": "2.14",
        "name": "alpha",
        "description": "First test agent for the listing tests.",
        "runtime": {"engine": "grok", "model": "grok-4"},
        "deploy": {"targets": ["ide"]},
        "category": "creator-template",
    }
    b_manifest = {
        "version": "2.14",
        "name": "bravo",
        "description": "Second test agent for the listing tests.",
        "runtime": {"engine": "grok", "model": "grok-4"},
        "deploy": {"targets": ["ide", "action"]},
        "category": "x-money-tool",
    }
    _write_manifest(tmp_path, "alpha", a_manifest)
    _write_manifest(tmp_path, "bravo", b_manifest)
    from xlos.cli import main

    runner = CliRunner()
    result = runner.invoke(main, ["list", "--json"])
    assert result.exit_code == 0, result.output
    parsed = json.loads(result.output)
    assert isinstance(parsed, list)
    assert len(parsed) == 2
    names = {m["name"] for m in parsed}
    assert names == {"alpha", "bravo"}
