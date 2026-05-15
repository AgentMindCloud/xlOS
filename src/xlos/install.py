"""Manifest installation for xlOS.

Validates each manifest against the vendored ``spec/v2.14/schema.json``,
runs the Constitution scanner, and only on a clean scan writes the manifest
under the per-user agents directory.
"""

from __future__ import annotations

import shutil
import sys
from pathlib import Path
from typing import Any

import click
import yaml
from filelock import FileLock
from platformdirs import user_data_dir

from xlos.safety import scan_manifest
from xlos.validators import validate_manifest_v214


def _install_root() -> Path:
    """Return the per-user install root for installed agents."""
    return Path(user_data_dir("xlos")) / "agents"


def _load_manifest(manifest: str | None, from_stdin: bool) -> tuple[dict[str, Any], str]:
    """Load manifest YAML text and parsed mapping from a file path or stdin."""
    if from_stdin:
        text = sys.stdin.read()
    elif manifest is not None:
        text = Path(manifest).read_text(encoding="utf-8")
    else:
        raise click.UsageError("Provide a manifest path or use --from-stdin.")
    parsed = yaml.safe_load(text)
    if not isinstance(parsed, dict):
        raise click.UsageError("Manifest root must be a YAML mapping.")
    return parsed, text


def install_command(manifest: str | None, from_stdin: bool) -> None:
    """Install a manifest by writing it under the per-user agents directory.

    Validates against the v2.14 schema and runs the Constitution scanner
    before writing. Errors at either stage abort the install.
    """
    data, text = _load_manifest(manifest, from_stdin)
    validate_manifest_v214(data)
    scan_result = scan_manifest(data)
    if scan_result.has_errors:
        offending = "; ".join(
            f.to_line().strip() for f in scan_result.findings if f.severity == "error"
        )
        raise click.ClickException(f"manifest fails Constitution checks: {offending}")

    name = data.get("name")
    if not isinstance(name, str) or not name:
        raise click.UsageError("Manifest is missing a non-empty 'name' field.")

    install_root = _install_root()
    install_root.mkdir(parents=True, exist_ok=True)
    install_dir = install_root / name
    lock_path = Path(f"{install_dir}.lock")

    # When installing from a manifest *file*, the agent's implementation
    # lives alongside it. A manifest with a runtime_dispatch block is inert
    # without that code, so copy the agent payload — not just the YAML.
    # Only a defined allowlist is copied (never the whole parent dir): this
    # is intentional about what an "agent" comprises and cannot recurse into
    # the install root. stdin installs stay manifest-only.
    payload_dirs = ("impl", "light", "tests", "examples")
    payload_files = ("constitution.md", "README.md", "DEMO.md")
    source_dir = Path(manifest).parent if manifest is not None else None
    ignore = shutil.ignore_patterns("__pycache__", "*.pyc", ".venv")

    with FileLock(str(lock_path)):
        install_dir.mkdir(parents=True, exist_ok=True)
        if source_dir is not None and source_dir.is_dir():
            for sub in payload_dirs:
                src = source_dir / sub
                if src.is_dir():
                    dst = install_dir / sub
                    if dst.exists():
                        shutil.rmtree(dst)
                    shutil.copytree(src, dst, ignore=ignore)
            for fname in payload_files:
                src = source_dir / fname
                if src.is_file():
                    shutil.copy2(src, install_dir / fname)
        target = install_dir / "grok-install.yaml"
        target.write_text(text, encoding="utf-8")
