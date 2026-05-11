"""Manifest validation for xlOS.

Validates manifests against the vendored grok-install v2.14 schema using
``jsonschema``. The schema lives outside the package, so we resolve it
through a small chain of strategies that works for both editable installs
and built wheels (when the schema is bundled via Hatch).
"""

from __future__ import annotations

import json
from functools import lru_cache
from importlib.resources import files
from pathlib import Path
from typing import Any

import jsonschema

__all__ = ["validate_manifest_v214"]


def _candidate_paths() -> list[Path]:
    """Return candidate filesystem paths to the v2.14 schema, in priority order."""
    out: list[Path] = []
    # 1. Bundled with the wheel (placed next to the package via Hatch
    #    force-include during build).
    try:
        bundled = files("xlos") / "schema.json"
        bundled_path = Path(str(bundled))
        if bundled_path.is_file():
            out.append(bundled_path)
    except (ModuleNotFoundError, FileNotFoundError):  # pragma: no cover
        pass
    # 2. Editable / source layout: walk up from this file until we hit a
    #    `spec/v2.14/schema.json` sibling.
    here = Path(__file__).resolve()
    for parent in [here, *here.parents]:
        candidate = parent / "spec" / "v2.14" / "schema.json"
        if candidate.is_file():
            out.append(candidate)
            break
    return out


@lru_cache(maxsize=1)
def _load_schema() -> dict[str, Any]:
    """Locate and parse the vendored v2.14 schema once per process."""
    for candidate in _candidate_paths():
        try:
            with candidate.open(encoding="utf-8") as fh:
                data = json.load(fh)
                if isinstance(data, dict):
                    return data
        except (OSError, json.JSONDecodeError) as exc:
            raise RuntimeError(f"Could not read v2.14 schema at {candidate}: {exc}") from exc
    raise RuntimeError(
        "v2.14 schema not found. Looked for an importlib.resources "
        "'xlos/schema.json' and for 'spec/v2.14/schema.json' next to the "
        "repo root. Re-install xlos or run from a source checkout."
    )


def validate_manifest_v214(manifest: dict[str, Any]) -> None:
    """Validate a manifest against grok-install spec v2.14.

    Raises :class:`jsonschema.ValidationError` on failure. The error's
    ``absolute_path`` contains the offending JSON-Pointer-style path.
    """
    schema = _load_schema()
    jsonschema.validate(manifest, schema)
