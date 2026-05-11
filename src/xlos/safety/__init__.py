"""Safety scanning for xlOS.

Exposes :func:`scan_manifest` and the :class:`ScanResult` /
:class:`Finding` dataclasses ported from grok-agent's Constitution
scanner. See ``constitution.md`` (sibling file) for the article catalogue
and ``scanner.py`` for check implementations.
"""

from __future__ import annotations

from xlos.safety.scanner import (
    Finding,
    ScanResult,
    registered_articles,
    scan_manifest,
)

__all__ = [
    "Finding",
    "ScanResult",
    "scan_manifest",
    "registered_articles",
]
