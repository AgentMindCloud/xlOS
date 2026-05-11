"""Manifest validation for xlOS.

Validates a parsed manifest dict against the vendored
``spec/v2.14/schema.json`` using ``jsonschema``. The schema is loaded once
per process and looked up in two places so the validator works equally well
from a source checkout and from an installed wheel:

1. ``importlib.resources`` lookup at ``xlos/_spec/v2.14/schema.json``
   (where ``pyproject.toml`` force-includes the schema in the built wheel).
2. Repo-tree fallback at ``<repo-root>/spec/v2.14/schema.json`` (used when
   running ``pytest`` against the source checkout).
"""

from __future__ import annotations

import json
from functools import lru_cache
from importlib import resources
from pathlib import Path
from typing import Any, Dict

import jsonschema

__all__ = ["validate_manifest_v214", "load_schema"]


@lru_cache(maxsize=1)
def load_schema() -> Dict[str, Any]:
    """Load the vendored v2.14 manifest JSON schema.

    Cached for the lifetime of the process. Returns the parsed schema dict.
    """
    # 1) Wheel / installed-package path via importlib.resources.
    try:
        schema_resource = resources.files("xlos").joinpath("_spec", "v2.14", "schema.json")
        if schema_resource.is_file():
            return json.loads(schema_resource.read_text(encoding="utf-8"))  # type: ignore[no-any-return]
    except (ModuleNotFoundError, FileNotFoundError):
        pass

    # 2) Source-tree fallback: src/xlos/validators/__init__.py ->
    #    ../../../spec/v2.14/schema.json
    here = Path(__file__).resolve()
    candidate = here.parent.parent.parent.parent / "spec" / "v2.14" / "schema.json"
    if candidate.is_file():
        parsed: Dict[str, Any] = json.loads(candidate.read_text(encoding="utf-8"))
        return parsed

    raise FileNotFoundError(
        "Could not locate spec/v2.14/schema.json. Looked under xlos._spec/v2.14/ "
        "(wheel) and the repo-tree spec/v2.14/ (source checkout)."
    )


def validate_manifest_v214(manifest: Dict[str, Any]) -> None:
    """Validate a manifest against grok-install spec v2.14.

    Raises :class:`jsonschema.ValidationError` on failure. The error object
    carries an ``absolute_path`` deque pointing at the offending field.
    """
    schema = load_schema()
    jsonschema.validate(instance=manifest, schema=schema)
