"""Runtime commands for xlOS: doctor, run, list."""

from __future__ import annotations

import json
import os
import subprocess
import sys
from pathlib import Path
from typing import Any

import click
import yaml
from platformdirs import user_data_dir
from rich.console import Console
from rich.table import Table

console = Console()


def _install_root() -> Path:
    """Return the per-user install root for installed agents."""
    return Path(user_data_dir("xlos")) / "agents"


def doctor_command() -> None:
    """Print environment diagnostics."""
    install_dir = _install_root()
    install_dir.mkdir(parents=True, exist_ok=True)
    writable = os.access(install_dir, os.W_OK)

    console.print(f"Python: {sys.version.split()[0]}")
    console.print(f"Platform: {sys.platform}")
    console.print(f"Install directory: {install_dir}")
    console.print(f"Install directory writable: {writable}")


def _load_installed_manifests() -> list[tuple[str, dict[str, Any]]]:
    """Return ``[(agent_name, manifest_dict), ...]`` for every installed agent.

    Skips entries whose ``grok-install.yaml`` is missing or unparseable so a
    single corrupted directory does not block ``xlos list``.
    """
    install_root = _install_root()
    if not install_root.is_dir():
        return []
    out: list[tuple[str, dict[str, Any]]] = []
    for entry in sorted(install_root.iterdir()):
        if not entry.is_dir():
            continue
        manifest_path = entry / "grok-install.yaml"
        if not manifest_path.is_file():
            continue
        try:
            data = yaml.safe_load(manifest_path.read_text(encoding="utf-8"))
        except (yaml.YAMLError, OSError):
            continue
        if isinstance(data, dict):
            out.append((entry.name, data))
    return out


def list_command(as_json: bool = False) -> None:
    """List installed agents.

    Walks the per-user agents directory and prints either a Rich table
    (``name | version | category | targets``) or, when ``as_json`` is true,
    a JSON array of the full manifest dicts.
    """
    rows = _load_installed_manifests()
    if as_json:
        click.echo(json.dumps([m for _, m in rows], indent=2, default=str))
        return

    if not rows:
        console.print("no agents installed")
        return

    table = Table(title="Installed agents")
    table.add_column("name")
    table.add_column("version")
    table.add_column("category")
    table.add_column("targets")
    for name, manifest in rows:
        version = str(manifest.get("version", ""))
        category = str(manifest.get("category", ""))
        deploy = manifest.get("deploy") or {}
        targets = deploy.get("targets") if isinstance(deploy, dict) else []
        if not isinstance(targets, list):
            targets = []
        table.add_row(name, version, category, ", ".join(map(str, targets)))
    console.print(table)


def _runtime_section(manifest: dict[str, Any]) -> dict[str, Any]:
    """Return the xlOS runtime dispatch block.

    Looks at ``extensions.xlos_runtime`` first (the migration target), then
    falls back to a top-level ``runtime`` mapping for forward-compat.
    """
    ext = manifest.get("extensions")
    if isinstance(ext, dict):
        xr = ext.get("xlos_runtime")
        if isinstance(xr, dict):
            return xr
    rt = manifest.get("runtime")
    if isinstance(rt, dict) and rt.get("type") in {"python_module", "streamlit_app"}:
        return rt
    return {}


def run_command(name: str) -> None:
    """Run an installed agent.

    Looks up ``<user_data_dir>/xlos/agents/<name>/grok-install.yaml``, reads
    its runtime section, and dispatches via ``subprocess.run``:

    - ``runtime.type: python_module`` → ``[sys.executable, "-m", module]``
    - ``runtime.type: streamlit_app`` → ``["streamlit", "run", entrypoint]``

    Other types log "not yet implemented" and exit non-zero.
    """
    install_root = _install_root()
    agent_dir = install_root / name
    manifest_path = agent_dir / "grok-install.yaml"
    if not manifest_path.is_file():
        console.print(f"agent not found: {name!r} (looked at {manifest_path})")
        sys.exit(1)

    try:
        manifest = yaml.safe_load(manifest_path.read_text(encoding="utf-8"))
    except (yaml.YAMLError, OSError) as exc:
        console.print(f"failed to read manifest for {name!r}: {exc}")
        sys.exit(1)
    if not isinstance(manifest, dict):
        console.print(f"manifest for {name!r} is not a mapping")
        sys.exit(1)

    runtime = _runtime_section(manifest)
    rt_type = runtime.get("type") if isinstance(runtime, dict) else None

    if rt_type == "python_module":
        module = runtime.get("module")
        if not isinstance(module, str) or not module:
            console.print(f"agent {name!r}: python_module runtime missing 'module'")
            sys.exit(1)
        cmd = [sys.executable, "-m", module]
        subprocess.run(cmd, cwd=str(agent_dir), check=False)
        return

    if rt_type == "streamlit_app":
        entrypoint = runtime.get("entrypoint")
        if not isinstance(entrypoint, str) or not entrypoint:
            console.print(f"agent {name!r}: streamlit_app runtime missing 'entrypoint'")
            sys.exit(1)
        cmd = ["streamlit", "run", entrypoint]
        subprocess.run(cmd, cwd=str(agent_dir), check=False)
        return

    console.print(
        f"agent {name!r}: runtime type {rt_type!r} not yet implemented "
        f"(supported: python_module, streamlit_app)"
    )
    sys.exit(1)
