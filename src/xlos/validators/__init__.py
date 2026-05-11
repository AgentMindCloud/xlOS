"""Manifest validation for xlOS."""

from __future__ import annotations

from typing import Any

__all__ = ["validate_manifest_v214"]


def validate_manifest_v214(manifest: dict[str, Any]) -> None:
    """Validate a manifest against grok-install spec v2.14.

    Stub for Phase 3a. Phase 3b will implement this against the vendored
    ``spec/v2.14/schema.json`` using ``jsonschema``.
    """
    return None
