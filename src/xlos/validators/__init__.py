"""Manifest validation for xlOS."""

from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Any

import jsonschema

__all__ = ["validate_manifest_v214", "load_schema_v214"]


@lru_cache(maxsize=1)
def load_schema_v214() -> dict[str, Any]:
    """Load and cache the vendored v2.14 JSON Schema as a parsed dict.

    The schema lives at ``spec/v2.14/schema.json`` in the xlOS source tree.
    When xlOS is installed as a wheel the schema ships inside the
    distribution; in a source checkout we walk up from this module to find
    the repo root. All path resolution is via ``pathlib.Path`` so the
    function works on every supported platform.
    """
    here = Path(__file__).resolve()
    # src/xlos/validators/__init__.py -> walk up to find spec/
    for parent in (here.parents[3], here.parents[2], here.parents[4]):
        cand = parent / "spec" / "v2.14" / "schema.json"
        if cand.exists():
            return json.loads(cand.read_text(encoding="utf-8"))

    # Wheel-install fallback: schema is force-included under
    # xlos/_resources/spec/v2.14/schema.json by hatchling.
    try:
        from importlib.resources import files

        import xlos

        cand_path = files(xlos).joinpath("_resources", "spec", "v2.14", "schema.json")
        if cand_path.is_file():
            return json.loads(cand_path.read_text(encoding="utf-8"))
    except (ImportError, ModuleNotFoundError, FileNotFoundError):
        pass

    raise FileNotFoundError(
        "spec/v2.14/schema.json not found; vendor it from grok-install-v2"
    )


def validate_manifest_v214(manifest: dict[str, Any]) -> None:
    """Validate a manifest dict against the vendored v2.14 schema.

    Raises:
        jsonschema.ValidationError: if validation fails. The error's
            ``absolute_path`` attribute identifies the offending field.
    """
    schema = load_schema_v214()
    jsonschema.validate(manifest, schema)
