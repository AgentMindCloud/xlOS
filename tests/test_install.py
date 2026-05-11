"""Tests for the install command path mechanics."""

from __future__ import annotations

import io
from pathlib import Path
from typing import Any

import pytest
import yaml

from xlos import install as install_module


def _patch_user_data_dir(monkeypatch: pytest.MonkeyPatch, tmp_path: Path) -> None:
    """Redirect platformdirs.user_data_dir to a tmp directory for the test."""
    monkeypatch.setattr(
        install_module,
        "user_data_dir",
        lambda *_args, **_kwargs: str(tmp_path / "xlos"),
    )


def _valid_manifest(name: str) -> dict[str, Any]:
    """A minimal v2.14-compliant manifest for install path-mechanics tests."""
    return {
        "version": "2.14",
        "name": name,
        "description": "Minimal test manifest used by install path-mechanics tests.",
        "runtime": {"engine": "grok", "model": "grok-4"},
        "deploy": {"targets": ["ide"]},
    }


def test_install_from_file(monkeypatch: pytest.MonkeyPatch, tmp_path: Path) -> None:
    _patch_user_data_dir(monkeypatch, tmp_path)
    manifest = _valid_manifest("test-agent")
    yaml_path = tmp_path / "manifest.yaml"
    yaml_path.write_text(yaml.safe_dump(manifest), encoding="utf-8")

    install_module.install_command(str(yaml_path), from_stdin=False)

    written = tmp_path / "xlos" / "agents" / "test-agent" / "grok-install.yaml"
    assert written.exists()
    assert yaml.safe_load(written.read_text(encoding="utf-8")) == manifest


def test_install_from_stdin(monkeypatch: pytest.MonkeyPatch, tmp_path: Path) -> None:
    _patch_user_data_dir(monkeypatch, tmp_path)
    manifest = _valid_manifest("stdin-agent")
    yaml_text = yaml.safe_dump(manifest)
    monkeypatch.setattr("sys.stdin", io.StringIO(yaml_text))

    install_module.install_command(None, from_stdin=True)

    written = tmp_path / "xlos" / "agents" / "stdin-agent" / "grok-install.yaml"
    assert written.exists()
    assert yaml.safe_load(written.read_text(encoding="utf-8")) == manifest
