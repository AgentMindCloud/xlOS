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


def _load_installed_manifest(name: str) -> tuple[Path, dict[str, Any]]:
    """Load an installed agent's manifest and return ``(path, parsed)``."""
    install_root = _install_root()
    manifest_path = install_root / name / "grok-install.yaml"
    if not manifest_path.is_file():
        raise click.ClickException(f"agent {name!r} is not installed at {manifest_path}")
    parsed = yaml.safe_load(manifest_path.read_text(encoding="utf-8"))
    if not isinstance(parsed, dict):
        raise click.ClickException(f"manifest at {manifest_path} is not a YAML mapping")
    return manifest_path, parsed


def _runtime_dispatch(manifest: dict[str, Any]) -> dict[str, Any] | None:
    """Extract the runtime_dispatch block (under extensions) from a manifest."""
    extensions = manifest.get("extensions")
    if not isinstance(extensions, dict):
        return None
    rd = extensions.get("runtime_dispatch")
    if not isinstance(rd, dict):
        return None
    return rd


def run_command(name: str) -> None:
    """Run an installed agent.

    Dispatches based on ``manifest.extensions.runtime_dispatch.type``:

    * ``streamlit_app`` -> ``streamlit run <entrypoint>``;
    * ``python_module`` -> ``<python> -m <module>``.

    Any other type prints a not-yet-implemented message and exits non-zero
    via ``click.ClickException``.
    """
    _, manifest = _load_installed_manifest(name)
    rd = _runtime_dispatch(manifest)
    if rd is None:
        raise click.ClickException(f"agent {name!r} has no extensions.runtime_dispatch block")
    rd_type = rd.get("type")
    if rd_type == "streamlit_app":
        entrypoint = rd.get("entrypoint")
        if not isinstance(entrypoint, str) or not entrypoint:
            raise click.ClickException(
                f"agent {name!r} runtime_dispatch.streamlit_app missing entrypoint"
            )
        subprocess.run(["streamlit", "run", entrypoint], check=False)
        return
    if rd_type == "python_module":
        module = rd.get("module")
        if not isinstance(module, str) or not module:
            raise click.ClickException(
                f"agent {name!r} runtime_dispatch.python_module missing module"
            )
        subprocess.run([sys.executable, "-m", module], check=False)
        return
    raise click.ClickException(f"runtime_dispatch.type={rd_type!r} not yet implemented in xlOS")


def _format_targets(manifest: dict[str, Any]) -> str:
    deploy = manifest.get("deploy")
    if not isinstance(deploy, dict):
        return ""
    targets = deploy.get("targets")
    if not isinstance(targets, list):
        return ""
    return ",".join(str(t) for t in targets if isinstance(t, str))


def _collect_installed_manifests(install_root: Path) -> list[tuple[str, dict[str, Any]]]:
    """Walk ``install_root`` and return ``(slug, manifest)`` for each agent."""
    entries: list[tuple[str, dict[str, Any]]] = []
    if not install_root.is_dir():
        return entries
    for child in sorted(install_root.iterdir()):
        if not child.is_dir():
            continue
        manifest_path = child / "grok-install.yaml"
        if not manifest_path.is_file():
            continue
        try:
            parsed = yaml.safe_load(manifest_path.read_text(encoding="utf-8"))
        except (OSError, yaml.YAMLError):
            continue
        if isinstance(parsed, dict):
            entries.append((child.name, parsed))
    return entries


def list_command(json_output: bool = False) -> None:
    """List installed agents.

    With ``--json`` (``json_output=True``) emit a JSON array of the full
    parsed manifest objects. Otherwise render a rich table with columns:
    ``name | version | category | targets``.
    """
    install_root = _install_root()
    entries = _collect_installed_manifests(install_root)
    if json_output:
        payload = [manifest for _, manifest in entries]
        console.print_json(json.dumps(payload))
        return
    if not entries:
        console.print("no agents installed")
        return
    table = Table(title="installed agents")
    table.add_column("name")
    table.add_column("version")
    table.add_column("category")
    table.add_column("targets")
    for slug, manifest in entries:
        name = str(manifest.get("name") or slug)
        version = str(manifest.get("version") or "")
        category = str(manifest.get("category") or "")
        targets = _format_targets(manifest)
        table.add_row(name, version, category, targets)
    console.print(table)
