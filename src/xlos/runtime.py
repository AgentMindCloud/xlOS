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


def _load_installed_manifest(agent_dir: Path) -> dict[str, Any] | None:
    """Load grok-install.yaml under an installed agent dir; None on error."""
    manifest_path = agent_dir / "grok-install.yaml"
    if not manifest_path.is_file():
        return None
    try:
        data = yaml.safe_load(manifest_path.read_text(encoding="utf-8"))
    except yaml.YAMLError:
        return None
    if not isinstance(data, dict):
        return None
    return data


def _iter_installed_manifests() -> list[tuple[str, dict[str, Any]]]:
    """Walk the install root, yielding (agent-name, manifest-dict) pairs."""
    root = _install_root()
    root.mkdir(parents=True, exist_ok=True)
    out: list[tuple[str, dict[str, Any]]] = []
    for entry in sorted(root.iterdir()):
        if not entry.is_dir():
            continue
        m = _load_installed_manifest(entry)
        if m is None:
            continue
        out.append((entry.name, m))
    return out


def list_command(as_json: bool = False) -> None:
    """List installed agents.

    Table columns: ``name | version | category | targets``. With ``as_json``
    emit a JSON array of full manifest objects. Always exits 0; emits a
    friendly "no agents installed" message on empty.
    """
    manifests = _iter_installed_manifests()

    if as_json:
        payload = [m for _name, m in manifests]
        console.print_json(json.dumps(payload, default=str))
        return

    if not manifests:
        console.print("no agents installed")
        return

    table = Table(show_header=True, header_style="bold")
    table.add_column("name")
    table.add_column("version")
    table.add_column("category")
    table.add_column("targets")
    for _name, m in manifests:
        deploy = m.get("deploy") if isinstance(m.get("deploy"), dict) else {}
        targets = deploy.get("targets") if isinstance(deploy, dict) else None
        targets_str = ",".join(targets) if isinstance(targets, list) else ""
        table.add_row(
            str(m.get("name", "")),
            str(m.get("version", "")),
            str(m.get("category", "")),
            targets_str,
        )
    console.print(table)


def run_command(name: str) -> None:
    """Run an installed agent.

    Resolves the manifest at ``user_data_dir("xlos") / "agents" / <name>``,
    reads ``extensions.runtime_dispatch``, and dispatches:

    * ``type: python_module`` -> ``[sys.executable, "-m", module]``
    * ``type: streamlit_app`` -> ``["streamlit", "run", entrypoint]``
    * other types -> exit non-zero with a "not yet implemented" message.

    Missing agents exit non-zero. The subprocess.run call is mockable.
    """
    install_dir = _install_root() / name
    manifest = _load_installed_manifest(install_dir)
    if manifest is None:
        console.print(f"error: no installed agent named {name!r}")
        sys.exit(2)

    dispatch = (manifest.get("extensions") or {}).get("runtime_dispatch")
    if not isinstance(dispatch, dict):
        console.print(
            f"error: agent {name!r} has no extensions.runtime_dispatch declaration"
        )
        sys.exit(3)

    dtype = dispatch.get("type")
    if dtype == "python_module":
        module = dispatch.get("module")
        if not isinstance(module, str) or not module:
            console.print(f"error: agent {name!r} runtime_dispatch.module is missing")
            sys.exit(4)
        completed = subprocess.run(
            [sys.executable, "-m", module],
            check=False,
        )
        sys.exit(completed.returncode)
    if dtype == "streamlit_app":
        entrypoint = dispatch.get("entrypoint")
        if not isinstance(entrypoint, str) or not entrypoint:
            console.print(
                f"error: agent {name!r} runtime_dispatch.entrypoint is missing"
            )
            sys.exit(5)
        ep_path = Path(entrypoint)
        if not ep_path.is_absolute():
            ep_path = install_dir / ep_path
        completed = subprocess.run(
            ["streamlit", "run", str(ep_path)],
            check=False,
        )
        sys.exit(completed.returncode)

    console.print(
        f"error: runtime_dispatch.type={dtype!r} not yet implemented for agent {name!r}"
    )
    sys.exit(6)
