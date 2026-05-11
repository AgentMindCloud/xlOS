"""Tests for the run_command dispatcher in xlos.runtime."""

from __future__ import annotations

import sys
from pathlib import Path
from typing import Any
from unittest.mock import MagicMock

import pytest
import yaml

from xlos import runtime as runtime_module


def _patch_user_data_dir(monkeypatch: pytest.MonkeyPatch, tmp_path: Path) -> None:
    monkeypatch.setattr(
        runtime_module,
        "user_data_dir",
        lambda *_args, **_kwargs: str(tmp_path / "xlos"),
    )


def _write_manifest(tmp_path: Path, name: str, manifest: dict[str, Any]) -> Path:
    agent_dir = tmp_path / "xlos" / "agents" / name
    agent_dir.mkdir(parents=True, exist_ok=True)
    p = agent_dir / "grok-install.yaml"
    p.write_text(yaml.safe_dump(manifest), encoding="utf-8")
    return agent_dir


def test_run_dispatches_python_module(monkeypatch: pytest.MonkeyPatch, tmp_path: Path) -> None:
    _patch_user_data_dir(monkeypatch, tmp_path)
    _write_manifest(
        tmp_path,
        "py-agent",
        {
            "version": "2.14",
            "name": "py-agent",
            "description": "Python module dispatch test.",
            "runtime": {"engine": "grok", "model": "grok-4"},
            "deploy": {"targets": ["ide"]},
            "extensions": {"runtime_dispatch": {"type": "python_module", "module": "foo.bar"}},
        },
    )
    fake = MagicMock(return_value=MagicMock(returncode=0))
    monkeypatch.setattr(runtime_module.subprocess, "run", fake)

    with pytest.raises(SystemExit) as excinfo:
        runtime_module.run_command("py-agent")
    assert excinfo.value.code == 0

    fake.assert_called_once()
    args = fake.call_args.args[0]
    assert args == [sys.executable, "-m", "foo.bar"]


def test_run_dispatches_streamlit_app(monkeypatch: pytest.MonkeyPatch, tmp_path: Path) -> None:
    _patch_user_data_dir(monkeypatch, tmp_path)
    agent_dir = _write_manifest(
        tmp_path,
        "stream-agent",
        {
            "version": "2.14",
            "name": "stream-agent",
            "description": "Streamlit dispatch test.",
            "runtime": {"engine": "grok", "model": "grok-4"},
            "deploy": {"targets": ["web"]},
            "extensions": {"runtime_dispatch": {"type": "streamlit_app", "entrypoint": "app.py"}},
        },
    )
    fake = MagicMock(return_value=MagicMock(returncode=0))
    monkeypatch.setattr(runtime_module.subprocess, "run", fake)

    with pytest.raises(SystemExit) as excinfo:
        runtime_module.run_command("stream-agent")
    assert excinfo.value.code == 0

    fake.assert_called_once()
    args = fake.call_args.args[0]
    assert args[0] == "streamlit"
    assert args[1] == "run"
    # entrypoint resolved relative to install dir
    assert args[2] == str(agent_dir / "app.py")


def test_run_unknown_agent_exits_nonzero(monkeypatch: pytest.MonkeyPatch, tmp_path: Path) -> None:
    _patch_user_data_dir(monkeypatch, tmp_path)
    with pytest.raises(SystemExit) as excinfo:
        runtime_module.run_command("does-not-exist")
    assert excinfo.value.code == 2


def test_run_unknown_dispatch_type_exits_nonzero(
    monkeypatch: pytest.MonkeyPatch, tmp_path: Path
) -> None:
    _patch_user_data_dir(monkeypatch, tmp_path)
    _write_manifest(
        tmp_path,
        "weird-agent",
        {
            "version": "2.14",
            "name": "weird-agent",
            "description": "Weird dispatch type test.",
            "runtime": {"engine": "grok", "model": "grok-4"},
            "deploy": {"targets": ["ide"]},
            "extensions": {"runtime_dispatch": {"type": "wasm", "module": "whatever"}},
        },
    )
    with pytest.raises(SystemExit) as excinfo:
        runtime_module.run_command("weird-agent")
    assert excinfo.value.code == 6


def test_run_agent_missing_dispatch_block_exits_nonzero(
    monkeypatch: pytest.MonkeyPatch, tmp_path: Path
) -> None:
    _patch_user_data_dir(monkeypatch, tmp_path)
    _write_manifest(
        tmp_path,
        "no-dispatch",
        {
            "version": "2.14",
            "name": "no-dispatch",
            "description": "No dispatch block declared.",
            "runtime": {"engine": "grok", "model": "grok-4"},
            "deploy": {"targets": ["ide"]},
        },
    )
    with pytest.raises(SystemExit) as excinfo:
        runtime_module.run_command("no-dispatch")
    assert excinfo.value.code == 3
