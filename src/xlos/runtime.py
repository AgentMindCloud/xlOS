"""Runtime commands for xlOS: doctor, run, list."""

from __future__ import annotations

import os
import sys
from pathlib import Path

from platformdirs import user_data_dir
from rich.console import Console

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


def run_command(name: str) -> None:
    """Run an installed agent (stub for Phase 3a)."""
    console.print(f"run: {name!r} not yet implemented in Phase 3a - see Phase 3b")


def list_command() -> None:
    """List installed agents (stub for Phase 3a)."""
    console.print("list: not yet implemented in Phase 3a - see Phase 3b")
