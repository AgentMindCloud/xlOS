#!/usr/bin/env python3
"""Validate a grok-install.yaml against the v2.14 standard.

Thin wrapper over the real xlOS validator and Constitution scanner — the same
checks `xlos install` runs before it registers an agent. Kept here so the
standard, its validator, and its templates live together under
`grok-install/`.

Usage:
    python grok-install/validator/validate.py path/to/grok-install.yaml
"""

from __future__ import annotations

import sys
from pathlib import Path


def main(argv: list[str]) -> int:
    if len(argv) != 2:
        print("usage: validate.py <path-to-grok-install.yaml>", file=sys.stderr)
        return 2

    path = Path(argv[1])
    if not path.is_file():
        print(f"error: no such file: {path}", file=sys.stderr)
        return 2

    try:
        import yaml

        from xlos.safety import scan_manifest
        from xlos.validators import validate_manifest_v214
    except ModuleNotFoundError as exc:
        print(
            f"error: xlOS is not importable ({exc.name}). Install it first:\n"
            "    pip install -e .",
            file=sys.stderr,
        )
        return 2

    data = yaml.safe_load(path.read_text(encoding="utf-8"))
    if not isinstance(data, dict):
        print("error: manifest root must be a YAML mapping", file=sys.stderr)
        return 1

    try:
        validate_manifest_v214(data)
    except Exception as exc:  # noqa: BLE001 — surface the validator's message
        print(f"SCHEMA FAIL: {exc}", file=sys.stderr)
        return 1

    result = scan_manifest(data)
    if result.has_errors:
        for finding in result.findings:
            if finding.severity == "error":
                print(f"CONSTITUTION FAIL: {finding.to_line().strip()}", file=sys.stderr)
        return 1

    print(f"OK: {path} validates against v2.14 and passes the Constitution scan")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
