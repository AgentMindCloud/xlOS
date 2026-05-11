"""Safety scanning for xlOS.

The Constitution scanner (ported from AgentMindCloud/grok-agent) lives in
:mod:`xlos.safety.scanner`. Agents declare which Constitution articles they
are bound to via ``extensions.constitution`` in their manifest; the scanner
runs only those checks. Agents without ``extensions.constitution`` are
skipped (``scan_manifest`` returns an empty result for them).
"""

from __future__ import annotations

from xlos.safety.scanner import Finding, ScanResult, scan_manifest

__all__ = ["Finding", "ScanResult", "scan_manifest"]
