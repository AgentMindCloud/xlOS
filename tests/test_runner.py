"""Tests for the `xlos run` dispatcher."""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path
from typing import Any

import pytest
import yaml

from xlos import runtime as runtime_module


def _patch_user_data_dir(monkeypatch: pytest.MonkeyPatch, tmp_path: Path) -> None:
    monkeypatch.setattr(
        runtime_module,
        "user_data_dir",
        lambda *_args, **_kwargs: str(tmp_path / "xlos"),
    )


def _install_manifest(tmp_path: Path, slug: str, manifest: dict[str, Any]) -> Path:
    install_dir = tmp_path / "xlos" / "agents" / slug
    install_dir.mkdir(parents=True, exist_ok=True)
    target = install_dir / "grok-install.yaml"
    target.write_text(yaml.safe_dump(manifest), encoding="utf-8")
    return target


def test_run_streamlit_app_invokes_subprocess(
    monkeypatch: pytest.MonkeyPatch, tmp_path: Path
) -> None:
    _patch_user_data_dir(monkeypatch, tmp_path)
    manifest = {
        "version": "2.14",
        "name": "demo-streamlit",
        "description": "Test streamlit-app runtime dispatch path.",
        "runtime": {"engine": "grok", "model": "grok-4"},
        "deploy": {"targets": ["web"]},
        "extensions": {
            "xlos_runtime": {"type": "streamlit_app", "entrypoint": "app.py"}
        },
    }
    _install_manifest(tmp_path, "demo-streamlit", manifest)

    calls: list[list[str]] = []

    class _CP:
        returncode = 0

    def _fake_run(args: list[str], check: bool = False) -> Any:
        calls.append(args)
        return _CP()

    monkeypatch.setattr(runtime_module.subprocess, "run", _fake_run)

    with pytest.raises(SystemExit) as exc_info:
        runtime_module.run_command("demo-streamlit")

    assert exc_info.value.code == 0
    assert calls == [["streamlit", "run", "app.py"]]


def test_run_python_module_invokes_subprocess(
    monkeypatch: pytest.MonkeyPatch, tmp_path: Path
) -> None:
    _patch_user_data_dir(monkeypatch, tmp_path)
    manifest = {
        "version": "2.14",
        "name": "demo-module",
        "description": "Test python-module runtime dispatch path.",
        "runtime": {"engine": "grok", "model": "grok-4"},
        "deploy": {"targets": ["worker"]},
        "extensions": {
            "xlos_runtime": {"type": "python_module", "module": "demo.module"}
        },
    }
    _install_manifest(tmp_path, "demo-module", manifest)

    calls: list[list[str]] = []

    class _CP:
        returncode = 0

    def _fake_run(args: list[str], check: bool = False) -> Any:
        calls.append(args)
        return _CP()

    monkeypatch.setattr(runtime_module.subprocess, "run", _fake_run)

    with pytest.raises(SystemExit) as exc_info:
        runtime_module.run_command("demo-module")

    assert exc_info.value.code == 0
    assert calls == [[sys.executable, "-m", "demo.module"]]


def test_run_unknown_agent_exits_non_zero(
    monkeypatch: pytest.MonkeyPatch, tmp_path: Path
) -> None:
    _patch_user_data_dir(monkeypatch, tmp_path)
    with pytest.raises(SystemExit) as exc_info:
        runtime_module.run_command("does-not-exist")
    assert exc_info.value.code != 0


def test_run_unknown_runtime_type_exits_non_zero(
    monkeypatch: pytest.MonkeyPatch, tmp_path: Path
) -> None:
    _patch_user_data_dir(monkeypatch, tmp_path)
    manifest = {
        "version": "2.14",
        "name": "demo-weird",
        "description": "Manifest with an unknown runtime dispatcher.",
        "runtime": {"engine": "grok", "model": "grok-4"},
        "deploy": {"targets": ["worker"]},
        "extensions": {"xlos_runtime": {"type": "wasm_blob"}},
    }
    _install_manifest(tmp_path, "demo-weird", manifest)

    def _fail(*_args: Any, **_kwargs: Any) -> None:
        raise AssertionError("subprocess.run should not be called for unknown type")

    monkeypatch.setattr(runtime_module.subprocess, "run", _fail)

    with pytest.raises(SystemExit) as exc_info:
        runtime_module.run_command("demo-weird")
    assert exc_info.value.code != 0
