"""Tests for the install command path mechanics."""

from __future__ import annotations

import io
from pathlib import Path

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


def test_install_from_file(monkeypatch: pytest.MonkeyPatch, tmp_path: Path) -> None:
    _patch_user_data_dir(monkeypatch, tmp_path)
    manifest = {"name": "test-agent", "version": "1.0.0"}
    yaml_path = tmp_path / "manifest.yaml"
    yaml_path.write_text(yaml.safe_dump(manifest), encoding="utf-8")

    install_module.install_command(str(yaml_path), from_stdin=False)

    written = tmp_path / "xlos" / "agents" / "test-agent" / "grok-install.yaml"
    assert written.exists()
    assert yaml.safe_load(written.read_text(encoding="utf-8")) == manifest


def test_install_from_stdin(monkeypatch: pytest.MonkeyPatch, tmp_path: Path) -> None:
    _patch_user_data_dir(monkeypatch, tmp_path)
    manifest = {"name": "stdin-agent", "version": "1.0.0"}
    yaml_text = yaml.safe_dump(manifest)
    monkeypatch.setattr("sys.stdin", io.StringIO(yaml_text))

    install_module.install_command(None, from_stdin=True)

    written = tmp_path / "xlos" / "agents" / "stdin-agent" / "grok-install.yaml"
    assert written.exists()
    assert yaml.safe_load(written.read_text(encoding="utf-8")) == manifest
