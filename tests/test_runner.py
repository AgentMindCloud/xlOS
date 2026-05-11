"""Tests for ``xlos.runtime.run_command``."""

from __future__ import annotations

import sys
from pathlib import Path
from typing import Any

import click
import pytest
import yaml

from xlos import runtime as runtime_module


def _patch_user_data_dir(monkeypatch: pytest.MonkeyPatch, tmp_path: Path) -> None:
    monkeypatch.setattr(
        runtime_module,
        "user_data_dir",
        lambda *_args, **_kwargs: str(tmp_path / "xlos"),
    )


def _install_manifest(tmp_path: Path, slug: str, manifest: dict[str, Any]) -> None:
    target = tmp_path / "xlos" / "agents" / slug / "grok-install.yaml"
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(yaml.safe_dump(manifest), encoding="utf-8")


def test_run_streamlit_app_invokes_streamlit(
    monkeypatch: pytest.MonkeyPatch, tmp_path: Path
) -> None:
    _patch_user_data_dir(monkeypatch, tmp_path)
    _install_manifest(
        tmp_path,
        "the-streamlit-agent",
        {
            "version": "2.14",
            "name": "the-streamlit-agent",
            "description": "Streamlit agent for the runner test.",
            "runtime": {"engine": "grok", "model": "grok-4"},
            "deploy": {"targets": ["ide"]},
            "extensions": {"runtime_dispatch": {"type": "streamlit_app", "entrypoint": "app.py"}},
        },
    )
    captured: list[list[str]] = []

    def fake_run(args: list[str], **_kwargs: Any) -> None:
        captured.append(args)

    monkeypatch.setattr(runtime_module.subprocess, "run", fake_run)
    runtime_module.run_command("the-streamlit-agent")
    assert captured == [["streamlit", "run", "app.py"]]


def test_run_python_module_invokes_sys_executable(
    monkeypatch: pytest.MonkeyPatch, tmp_path: Path
) -> None:
    _patch_user_data_dir(monkeypatch, tmp_path)
    _install_manifest(
        tmp_path,
        "the-module-agent",
        {
            "version": "2.14",
            "name": "the-module-agent",
            "description": "Python module agent for the runner test.",
            "runtime": {"engine": "grok", "model": "grok-4"},
            "deploy": {"targets": ["ide"]},
            "extensions": {
                "runtime_dispatch": {"type": "python_module", "module": "some_pkg.entry"}
            },
        },
    )
    captured: list[list[str]] = []

    def fake_run(args: list[str], **_kwargs: Any) -> None:
        captured.append(args)

    monkeypatch.setattr(runtime_module.subprocess, "run", fake_run)
    runtime_module.run_command("the-module-agent")
    assert captured == [[sys.executable, "-m", "some_pkg.entry"]]


def test_run_unknown_agent_raises_click_exception(
    monkeypatch: pytest.MonkeyPatch, tmp_path: Path
) -> None:
    _patch_user_data_dir(monkeypatch, tmp_path)
    with pytest.raises(click.ClickException) as exc:
        runtime_module.run_command("no-such-agent")
    assert "no-such-agent" in str(exc.value)


def test_run_agent_without_runtime_dispatch_raises(
    monkeypatch: pytest.MonkeyPatch, tmp_path: Path
) -> None:
    _patch_user_data_dir(monkeypatch, tmp_path)
    _install_manifest(
        tmp_path,
        "naked-agent",
        {
            "version": "2.14",
            "name": "naked-agent",
            "description": "Agent without a runtime_dispatch block.",
            "runtime": {"engine": "grok", "model": "grok-4"},
            "deploy": {"targets": ["ide"]},
        },
    )
    with pytest.raises(click.ClickException) as exc:
        runtime_module.run_command("naked-agent")
    assert "runtime_dispatch" in str(exc.value)


def test_run_agent_with_unknown_dispatch_type_raises(
    monkeypatch: pytest.MonkeyPatch, tmp_path: Path
) -> None:
    _patch_user_data_dir(monkeypatch, tmp_path)
    _install_manifest(
        tmp_path,
        "future-agent",
        {
            "version": "2.14",
            "name": "future-agent",
            "description": "Agent declaring a not-yet-implemented runtime type.",
            "runtime": {"engine": "grok", "model": "grok-4"},
            "deploy": {"targets": ["ide"]},
            "extensions": {"runtime_dispatch": {"type": "wasm_module"}},
        },
    )
    with pytest.raises(click.ClickException) as exc:
        runtime_module.run_command("future-agent")
    assert "not yet implemented" in str(exc.value)
