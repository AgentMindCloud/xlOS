"""Manifest validation for xlOS.

Loads the vendored ``spec/v2.14/schema.json`` via ``importlib.resources`` so
it works whether xlOS is run from a source checkout or installed as a wheel.
"""

from __future__ import annotations

import json
from functools import lru_cache
from importlib.resources import files
from typing import Any

import jsonschema

__all__ = ["load_schema", "validate_manifest_v214"]


@lru_cache(maxsize=1)
def load_schema() -> dict[str, Any]:
    """Load and cache the vendored v2.14 schema.

    Searches two locations so the schema is found in both layouts:

    * installed wheel: ``xlos/_resources/schema.json`` (force-included by
      ``[tool.hatch.build.targets.wheel.force-include]`` in pyproject.toml);
    * source checkout: ``<repo>/spec/v2.14/schema.json``.
    """
    # Try the wheel-resource location first.
    try:
        resource = files("xlos").joinpath("_resources/schema.json")
        if resource.is_file():
            text = resource.read_text(encoding="utf-8")
            parsed: dict[str, Any] = json.loads(text)
            return parsed
    except (FileNotFoundError, ModuleNotFoundError):
        pass
    # Fall back to the in-tree path (relative to xlos package).
    from pathlib import Path

    repo_root = Path(__file__).resolve().parents[3]
    in_tree = repo_root / "spec" / "v2.14" / "schema.json"
    if not in_tree.is_file():
        raise FileNotFoundError(
            "v2.14 schema not found in wheel resources or in-tree at spec/v2.14/"
        )
    parsed_tree: dict[str, Any] = json.loads(in_tree.read_text(encoding="utf-8"))
    return parsed_tree


def validate_manifest_v214(manifest: dict[str, Any]) -> None:
    """Validate ``manifest`` against the vendored v2.14 schema.

    Raises ``jsonschema.ValidationError`` on the first failure. The exception
    carries the offending JSON path via ``absolute_path``.
    """
    schema = load_schema()
    jsonschema.validate(manifest, schema)
