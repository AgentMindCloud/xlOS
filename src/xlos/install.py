"""Manifest installation for xlOS.

Validates against the vendored spec/v2.14 schema and runs the Constitution
scanner before writing the manifest into the per-user agents directory.
"""

from __future__ import annotations

import sys
from pathlib import Path
from typing import Any

import click
import jsonschema
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
    """Install a manifest by writing it under the per-user agents directory."""
    data, text = _load_manifest(manifest, from_stdin)
    try:
        validate_manifest_v214(data)
    except jsonschema.ValidationError as exc:
        path = "/".join(map(str, exc.absolute_path)) or "<root>"
        raise click.ClickException(
            f"manifest failed v2.14 validation at {path}: {exc.message}"
        ) from exc

    scan = scan_manifest(data)
    if scan.has_high_severity:
        details = "; ".join(
            f"[{f.article}] {f.code}: {f.message}" for f in scan.findings if f.severity == "error"
        )
        raise click.ClickException(f"Constitution scanner refused install: {details}")

    name = data.get("name")
    if not isinstance(name, str) or not name:
        raise click.UsageError("Manifest is missing a non-empty 'name' field.")

    install_root = _install_root()
    install_root.mkdir(parents=True, exist_ok=True)
    install_dir = install_root / name
    lock_path = Path(f"{install_dir}.lock")

    with FileLock(str(lock_path)):
        install_dir.mkdir(parents=True, exist_ok=True)
        target = install_dir / "grok-install.yaml"
        target.write_text(text, encoding="utf-8")
