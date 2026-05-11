"""Tests for the `xlos list` command."""

from __future__ import annotations

import json
import re
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


def _write_manifest(tmp_path: Path, slug: str, body: dict[str, Any]) -> None:
    d = tmp_path / "xlos" / "agents" / slug
    d.mkdir(parents=True, exist_ok=True)
    (d / "grok-install.yaml").write_text(yaml.safe_dump(body), encoding="utf-8")


def test_list_empty_directory_prints_message(
    monkeypatch: pytest.MonkeyPatch, tmp_path: Path
) -> None:
    _patch_user_data_dir(monkeypatch, tmp_path)
    from xlos.cli import main

    runner = CliRunner()
    result = runner.invoke(main, ["list"])
    assert result.exit_code == 0, result.output
    assert "no agents installed" in result.output


def test_list_table_contains_installed_agents(
    monkeypatch: pytest.MonkeyPatch, tmp_path: Path
) -> None:
    _patch_user_data_dir(monkeypatch, tmp_path)
    _write_manifest(
        tmp_path,
        "alpha",
        {
            "version": "2.14",
            "name": "alpha",
            "category": "creator-template",
            "deploy": {"targets": ["worker", "web"]},
        },
    )
    _write_manifest(
        tmp_path,
        "beta",
        {
            "version": "2.14",
            "name": "beta",
            "category": "x-money-tool",
            "deploy": {"targets": ["web"]},
        },
    )

    from xlos.cli import main

    runner = CliRunner()
    result = runner.invoke(main, ["list"])
    assert result.exit_code == 0, result.output
    # Both agents must appear
    assert "alpha" in result.output
    assert "beta" in result.output

    # Column order: name | version | category | targets
    output = result.output
    # Find the header row
    headers = re.findall(r"name|version|category|targets", output, flags=re.IGNORECASE)
    # Take the first 4 unique columns in order
    seen: list[str] = []
    for h in headers:
        low = h.lower()
        if low not in seen:
            seen.append(low)
    assert seen[:4] == ["name", "version", "category", "targets"], seen


def test_list_json_output_emits_full_manifests(
    monkeypatch: pytest.MonkeyPatch, tmp_path: Path
) -> None:
    _patch_user_data_dir(monkeypatch, tmp_path)
    _write_manifest(
        tmp_path,
        "alpha",
        {
            "version": "2.14",
            "name": "alpha",
            "category": "creator-template",
            "deploy": {"targets": ["worker"]},
        },
    )
    _write_manifest(
        tmp_path,
        "beta",
        {
            "version": "2.14",
            "name": "beta",
            "category": "x-money-tool",
            "deploy": {"targets": ["web"]},
        },
    )

    from xlos.cli import main

    runner = CliRunner()
    result = runner.invoke(main, ["list", "--json"])
    assert result.exit_code == 0, result.output
    payload = json.loads(result.output)
    assert isinstance(payload, list)
    names = {entry["name"] for entry in payload}
    assert names == {"alpha", "beta"}
    # Each entry has the canonical fields
    for entry in payload:
        for key in ("name", "version", "category", "deploy"):
            assert key in entry, f"missing {key} in {entry}"
