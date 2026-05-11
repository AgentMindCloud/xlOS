"""Tests for the `xlos run` dispatch behaviour."""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path
from typing import Any

import pytest
import yaml

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


def test_run_python_module_dispatches_subprocess(
    monkeypatch: pytest.MonkeyPatch, tmp_path: Path
) -> None:
    install_root = _patch_user_data_dir(monkeypatch, tmp_path)
    _install_agent(
        install_root,
        "py-agent",
        {
            "version": "2.14",
            "name": "py-agent",
            "description": "Python module dispatch fixture.",
            "runtime": {"engine": "grok", "model": "grok-4"},
            "deploy": {"targets": ["worker"]},
            "extensions": {
                "xlos_runtime": {"type": "python_module", "module": "demo.app"},
            },
        },
    )
    calls: list[list[str]] = []
    monkeypatch.setattr(
        runtime_module.subprocess,
        "run",
        lambda cmd, **_kw: calls.append(cmd) or subprocess.CompletedProcess(cmd, 0),
    )

    runtime_module.run_command("py-agent")

    assert calls == [[sys.executable, "-m", "demo.app"]]


def test_run_streamlit_app_dispatches_streamlit(
    monkeypatch: pytest.MonkeyPatch, tmp_path: Path
) -> None:
    install_root = _patch_user_data_dir(monkeypatch, tmp_path)
    _install_agent(
        install_root,
        "web-agent",
        {
            "version": "2.14",
            "name": "web-agent",
            "description": "Streamlit app dispatch fixture.",
            "runtime": {"engine": "grok", "model": "grok-4"},
            "deploy": {"targets": ["web"]},
            "extensions": {
                "xlos_runtime": {"type": "streamlit_app", "entrypoint": "app.py"},
            },
        },
    )
    calls: list[list[str]] = []
    monkeypatch.setattr(
        runtime_module.subprocess,
        "run",
        lambda cmd, **_kw: calls.append(cmd) or subprocess.CompletedProcess(cmd, 0),
    )

    runtime_module.run_command("web-agent")

    assert calls == [["streamlit", "run", "app.py"]]


def test_run_unknown_agent_exits_non_zero(monkeypatch: pytest.MonkeyPatch, tmp_path: Path) -> None:
    _patch_user_data_dir(monkeypatch, tmp_path)
    with pytest.raises(SystemExit) as info:
        runtime_module.run_command("missing-agent")
    assert info.value.code != 0


def test_run_unknown_runtime_type_exits_non_zero(
    monkeypatch: pytest.MonkeyPatch, tmp_path: Path
) -> None:
    install_root = _patch_user_data_dir(monkeypatch, tmp_path)
    _install_agent(
        install_root,
        "exotic-agent",
        {
            "version": "2.14",
            "name": "exotic-agent",
            "description": "Has a runtime xlOS does not yet support.",
            "runtime": {"engine": "grok", "model": "grok-4"},
            "deploy": {"targets": ["worker"]},
            "extensions": {
                "xlos_runtime": {"type": "wasm_module", "module": "demo.wasm"},
            },
        },
    )
    with pytest.raises(SystemExit) as info:
        runtime_module.run_command("exotic-agent")
    assert info.value.code != 0
