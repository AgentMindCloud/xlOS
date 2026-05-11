"""Safety scanning for xlOS."""

from __future__ import annotations

from typing import Any

__all__ = ["scan_manifest"]


def scan_manifest(manifest: dict[str, Any]) -> None:
    """Scan a manifest for safety violations.

    Stub for Phase 3a. Phase 3b will port the Constitution scanner from
    ``grok-agent/safety/``.
    """
    return None
