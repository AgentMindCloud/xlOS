"""Runtime commands for xlOS: doctor, run, list."""

from __future__ import annotations

import json
import os
import subprocess
import sys
from pathlib import Path
from typing import Any

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


def _iter_installed_manifests() -> list[tuple[str, dict[str, Any]]]:
    """Yield (agent_name, parsed_manifest) for every installed agent.

    An installed agent is a directory under ``user_data_dir('xlos')/agents/``
    containing a ``grok-install.yaml`` file. Directories that fail to parse
    are silently skipped — ``doctor`` reports broken installs separately.
    """
    root = _install_root()
    if not root.exists():
        return []
    items: list[tuple[str, dict[str, Any]]] = []
    for entry in sorted(root.iterdir()):
        if not entry.is_dir():
            continue
        manifest_path = entry / "grok-install.yaml"
        if not manifest_path.is_file():
            continue
        try:
            data = yaml.safe_load(manifest_path.read_text(encoding="utf-8"))
        except yaml.YAMLError:
            continue
        if not isinstance(data, dict):
            continue
        items.append((entry.name, data))
    return items


def list_command(json_output: bool = False) -> None:
    """List installed agents in a table (or as JSON with ``--json``)."""
    agents = _iter_installed_manifests()

    if json_output:
        payload = [data for _, data in agents]
        console.print_json(json.dumps(payload))
        return

    if not agents:
        console.print("no agents installed")
        return

    table = Table(title="Installed xlOS agents")
    table.add_column("name", style="bold")
    table.add_column("version")
    table.add_column("category")
    table.add_column("targets")

    for name, data in agents:
        version = str(data.get("version", ""))
        category = str(data.get("category", ""))
        targets = ",".join((data.get("deploy") or {}).get("targets") or [])
        table.add_row(name, version, category, targets)

    console.print(table)


def run_command(name: str) -> None:
    """Run an installed agent by dispatching from its manifest runtime block."""
    manifest_path = _install_root() / name / "grok-install.yaml"
    if not manifest_path.is_file():
        console.print(f"agent {name!r} is not installed")
        raise SystemExit(2)

    try:
        manifest = yaml.safe_load(manifest_path.read_text(encoding="utf-8"))
    except yaml.YAMLError as exc:
        console.print(f"agent {name!r} has a malformed manifest: {exc}")
        raise SystemExit(2) from exc

    if not isinstance(manifest, dict):
        console.print(f"agent {name!r} manifest root must be a mapping")
        raise SystemExit(2)

    runtime_hint = (manifest.get("extensions") or {}).get("xlos_runtime") or {}
    rtype = str(runtime_hint.get("type", "")).strip()

    if rtype == "python_module":
        module = str(runtime_hint.get("module", "")).strip()
        if not module:
            console.print(f"agent {name!r}: extensions.xlos_runtime.module is empty")
            raise SystemExit(2)
        proc = subprocess.run([sys.executable, "-m", module], check=False)
        raise SystemExit(proc.returncode)

    if rtype == "streamlit_app":
        entrypoint = str(runtime_hint.get("entrypoint", "")).strip()
        if not entrypoint:
            console.print(f"agent {name!r}: extensions.xlos_runtime.entrypoint is empty")
            raise SystemExit(2)
        proc = subprocess.run(["streamlit", "run", entrypoint], check=False)
        raise SystemExit(proc.returncode)

    console.print(f"agent {name!r}: runtime type {rtype!r} not yet implemented")
    raise SystemExit(3)
