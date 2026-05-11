"""Safety scanning for xlOS.

Re-exports the public scan API. The Constitution rule library is in
``xlos.safety.scanner``; the rendered Constitution text is shipped at
``xlos/safety/constitution.md`` and discoverable via ``constitution_path()``.
"""

from __future__ import annotations

from xlos.safety.scanner import (
    CHECKS,
    CONSTITUTION_VERSION,
    Finding,
    ScanResult,
    SEVERITIES,
    constitution_path,
    scan_manifest,
)

__all__ = [
    "CHECKS",
    "CONSTITUTION_VERSION",
    "Finding",
    "ScanResult",
    "SEVERITIES",
    "constitution_path",
    "scan_manifest",
]
