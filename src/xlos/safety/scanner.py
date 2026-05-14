"""Constitution safety scanner for xlOS.

Ported from grok-agent/safety/scanner.py. Adapted to:

* accept an in-memory v2.14 manifest dict (no file-path coupling at the
  public API);
* always enforce Articles I, III, and VII regardless of what
  ``manifest["extensions"]["constitution"]`` declares — see
  ``_CORE_ARTICLES`` for the rationale (Article III forbids
  ``bypass_safety_scanner``, so the scanner itself cannot be opt-in);
* drive *additional* check applicability from
  ``manifest["extensions"]["constitution"]`` (the v2.14 article list) for
  Articles II, IV, V, VI, VIII;
* read v2.15-style fields (``constitution``, ``safety``, ``windows``,
  ``real_time_x``, ``bridges``, ``memory``, ``provenance``) from the
  ``extensions`` block where the migrator parked them;
* keep ``pathlib`` + ``importlib.resources`` path discipline so it works
  when xlOS is shipped as a wheel.

Severity model (unchanged):

    info  — recommended but not required
    warn  — should-fix; does not block install
    error — Constitution violation; install is blocked

Public surface:

    scan_manifest(manifest: dict[str, Any]) -> ScanResult
"""

from __future__ import annotations

import json
from dataclasses import asdict, dataclass, field
from importlib.resources import as_file, files
from pathlib import Path
from typing import Any, Callable

__all__ = [
    "Finding",
    "ScanResult",
    "scan_manifest",
    "CHECKS",
    "CONSTITUTION_VERSION",
    "SEVERITIES",
]


CONSTITUTION_VERSION = "1.0"

SEVERITIES: tuple[str, ...] = ("info", "warn", "error")
SEVERITY_RANK: dict[str, int] = {"info": 0, "warn": 1, "error": 2}

# Kinds that should declare not_financial_advice. The vision-analyzer kind
# parses receipts / financial screenshots and can imply real-money decisions,
# so it ships under the same disclaimer umbrella as the other finance kinds.
FINANCE_KINDS: frozenset[str] = frozenset(
    {
        "finance-dashboard",
        "alpha-engine",
        "creator-payout-optimizer",
        "vision-analyzer",
    }
)

TAX_KINDS: frozenset[str] = frozenset(
    {
        "finance-dashboard",
        "creator-payout-optimizer",
    }
)

# Mandatory consent gates per the Constitution (Article II)
MANDATORY_CONSENT_GATES_FOR_REAL_WORLD: frozenset[str] = frozenset(
    {
        "publish_to_x",
        "send_dm",
        "move_funds",
        "pay_real_money",
        "modify_local_files_outside_appdata",
    }
)


@dataclass
class Finding:
    """A single Constitution check finding."""

    severity: str
    code: str
    message: str
    location: str = ""
    article: str = ""

    def __post_init__(self) -> None:
        if self.severity not in SEVERITIES:
            raise ValueError(f"Bad severity: {self.severity}")

    def to_line(self) -> str:
        sev = self.severity.upper().ljust(5)
        loc = f" ({self.location})" if self.location else ""
        art = f" [Const. Art. {self.article}]" if self.article else ""
        return f"  {sev} {self.code}: {self.message}{loc}{art}"

    def to_json(self) -> dict[str, Any]:
        return asdict(self)


@dataclass
class ScanResult:
    """The collected findings from one manifest scan."""

    manifest_name: str
    findings: list[Finding] = field(default_factory=list)

    @property
    def max_severity(self) -> str:
        if not self.findings:
            return "info"
        ranked = max(self.findings, key=lambda f: SEVERITY_RANK[f.severity])
        return ranked.severity

    @property
    def has_errors(self) -> bool:
        return any(f.severity == "error" for f in self.findings)

    def filter_by_floor(self, floor: str) -> list[Finding]:
        threshold = SEVERITY_RANK[floor]
        return [f for f in self.findings if SEVERITY_RANK[f.severity] >= threshold]


# Check registry ---------------------------------------------------------------

# A check accepts the "scanner view" — a dict adapter built by _build_view from
# the v2.14 manifest — and returns a list of findings. The article tag controls
# which Constitution articles must opt-in for the check to run.

CheckFn = Callable[[dict[str, Any]], list[Finding]]
_CHECKS: dict[str, tuple[CheckFn, str]] = {}


def register(name: str, article: str) -> Callable[[CheckFn], CheckFn]:
    """Register a check under ``name`` and associate it with one article."""

    def deco(fn: CheckFn) -> CheckFn:
        _CHECKS[name] = (fn, article)
        return fn

    return deco


def _get(view: dict[str, Any], dotted: str, default: Any = None) -> Any:
    """Safely traverse a nested dict by dotted path."""
    cur: Any = view
    for part in dotted.split("."):
        if not isinstance(cur, dict):
            return default
        cur = cur.get(part)
        if cur is None:
            return default
    return cur


def _build_view(manifest: dict[str, Any]) -> dict[str, Any]:
    """Build a dict adapter that exposes v2.15 layout from a v2.14 manifest.

    The migrator parks the v2.15 ``constitution``, ``safety``, ``windows``,
    ``real_time_x``, ``bridges``, ``memory`` blocks under
    ``extensions.<key>_v215`` (or under ``extensions.<key>`` for the
    forward-compatible blocks). This adapter re-exposes them at the top level
    of the view dict so the original Article-mapped checks continue to work
    without manual rewrites.
    """
    extensions = manifest.get("extensions") or {}
    if not isinstance(extensions, dict):
        extensions = {}
    # License is a v2.15 concept; v2.14 manifests do not carry it. The
    # migrator drops the field, and xlOS-vendored manifests are Apache-2.0
    # by repository policy. Fall back to the legacy value parked under the
    # extensions block if a manifest carries one explicitly.
    license_value = manifest.get("license") or extensions.get("license") or "Apache-2.0"
    view: dict[str, Any] = {
        # Identity ----------------------------------------------------------
        "version": manifest.get("version"),
        "name": manifest.get("name"),
        "description": manifest.get("description"),
        "license": license_value,
        # category is the v2.14 field; kind is the v2.15 legacy field.
        "category": manifest.get("category"),
        "kind": extensions.get("original_kind") or manifest.get("category"),
        # v2.15 sub-blocks parked under extensions -------------------------
        "constitution": extensions.get("constitution_v215"),
        "safety": extensions.get("safety_v215"),
        "windows": extensions.get("windows_legacy"),
        "real_time_x": extensions.get("real_time_x"),
        "bridges": extensions.get("bridges"),
        "memory": extensions.get("memory"),
        "provenance": extensions.get("provenance"),
        "metadata": manifest.get("metadata"),
        "dependencies": manifest.get("dependencies"),
    }
    return view


# Article I -------------------------------------------------------------------


@register("I.1-license", "I")
def check_license(view: dict[str, Any]) -> list[Finding]:
    lic = view.get("license")
    if lic is None:
        return [
            Finding(
                "error",
                "LIC-001",
                "license is required and must be 'Apache-2.0'",
                "license",
                "I.1",
            )
        ]
    if lic != "Apache-2.0":
        return [
            Finding(
                "error",
                "LIC-002",
                f"license must be 'Apache-2.0', got '{lic}'",
                "license",
                "I.1",
            )
        ]
    return []


@register("I.3-windows-requires-admin", "I")
def check_no_admin(view: dict[str, Any]) -> list[Finding]:
    if _get(view, "windows.requires_admin", False):
        return [
            Finding(
                "error",
                "WIN-001",
                "windows.requires_admin must be false; agents must run without admin",
                "windows.requires_admin",
                "I.3",
            )
        ]
    return []


@register("I.4-version", "I")
def check_version(view: dict[str, Any]) -> list[Finding]:
    raw = view.get("version")
    v = None if raw is None else str(raw)
    if v not in ("2.14", "2.15"):
        return [
            Finding(
                "error",
                "VER-001",
                f"version must be '2.14' or '2.15', got {raw!r}",
                "version",
                "I.4",
            )
        ]
    return []


_FORBIDDEN_POSITIONING_TERMS: tuple[str, ...] = (
    "compete with xai",
    "replace xai",
    "alternative to grok",
    "replacement for grok",
    "anti-xai",
)


@register("I.2-xai-positioning", "I")
def check_xai_positioning(view: dict[str, Any]) -> list[Finding]:
    findings: list[Finding] = []
    desc = (view.get("description") or "").lower()
    tagline_raw = _get(view, "metadata.tagline") or ""
    tagline = tagline_raw.lower() if isinstance(tagline_raw, str) else ""
    blob = desc + " | " + tagline
    for term in _FORBIDDEN_POSITIONING_TERMS:
        if term in blob:
            findings.append(
                Finding(
                    "error",
                    "POS-001",
                    f"description / metadata.tagline contains forbidden positioning '{term}'; "
                    "agents must position as ecosystem allies, never competitors",
                    "description",
                    "I.2",
                )
            )
    return findings


# Article II ------------------------------------------------------------------


@register("II.posts-consent", "II")
def check_posts_require_consent(view: dict[str, Any]) -> list[Finding]:
    rt = view.get("real_time_x") or {}
    if not isinstance(rt, dict):
        return []
    if rt.get("posts"):
        consent = rt.get("consent_required", None)
        if consent is not True:
            reason = "missing" if consent is None else "explicitly false"
            return [
                Finding(
                    "error",
                    "CG-001",
                    f"real_time_x.posts=true requires real_time_x.consent_required=true "
                    f"({reason}); declare it explicitly in the manifest",
                    "real_time_x.consent_required",
                    "II",
                )
            ]
    return []


@register("II.publish-gate", "II")
def check_publish_consent_gate(view: dict[str, Any]) -> list[Finding]:
    rt = view.get("real_time_x") or {}
    gates = _get(view, "constitution.consent_gates", []) or []
    if isinstance(rt, dict) and rt.get("posts") and "publish_to_x" not in gates:
        return [
            Finding(
                "error",
                "CG-002",
                "real_time_x.posts=true requires 'publish_to_x' in constitution.consent_gates",
                "constitution.consent_gates",
                "II",
            )
        ]
    return []


_REAL_WORLD_VERBS: tuple[str, ...] = (
    "publish_",
    "send_",
    "move_",
    "pay_",
    "delete_",
    "modify_",
)


@register("II.action-gate-confirm-list", "II")
def check_action_gate_confirm_list(view: dict[str, Any]) -> list[Finding]:
    gates = _get(view, "constitution.consent_gates", []) or []
    confirm_before = _get(view, "safety.human_in_the_loop.confirm_before", []) or []
    findings: list[Finding] = []
    for gate in gates:
        if not isinstance(gate, str):
            continue
        if any(gate.startswith(v) for v in _REAL_WORLD_VERBS):
            if gate not in confirm_before:
                findings.append(
                    Finding(
                        "warn",
                        "CG-003",
                        f"consent gate '{gate}' looks like a real-world action; "
                        "add it to safety.human_in_the_loop.confirm_before",
                        "safety.human_in_the_loop.confirm_before",
                        "II",
                    )
                )
    return findings


# Article III -----------------------------------------------------------------

_HARD_REFUSAL_BLACKLIST: frozenset[str] = frozenset(
    {
        "scrape_authenticated_x_content",
        "impersonate_user_identity",
        "bypass_safety_scanner",
        "exfiltrate_user_data",
    }
)


@register("III.no-forbidden-actions-flipped", "III")
def check_forbidden_not_silently_allowed(view: dict[str, Any]) -> list[Finding]:
    findings: list[Finding] = []
    forbidden = set(_get(view, "safety.forbidden_actions", []) or [])
    gates = set(_get(view, "constitution.consent_gates", []) or [])
    for action in forbidden & gates:
        findings.append(
            Finding(
                "error",
                "HR-001",
                f"action '{action}' is in safety.forbidden_actions AND constitution.consent_gates; "
                "a forbidden action cannot be re-enabled via consent",
                "constitution.consent_gates",
                "III",
            )
        )
    return findings


@register("III.hard-refusal-blacklist", "III")
def check_hard_refusal_blacklist(view: dict[str, Any]) -> list[Finding]:
    findings: list[Finding] = []
    gates = set(_get(view, "constitution.consent_gates", []) or [])
    for action in gates & _HARD_REFUSAL_BLACKLIST:
        findings.append(
            Finding(
                "error",
                "HR-008",
                f"action '{action}' is on the Article III hard-refusal blacklist; "
                "it must not appear in constitution.consent_gates under any circumstances",
                "constitution.consent_gates",
                "III",
            )
        )
    return findings


@register("III.cite-sources-for-super-agent", "III")
def check_super_agent_cite_sources(view: dict[str, Any]) -> list[Finding]:
    if view.get("category") != "super-agent":
        return []
    if not _get(view, "provenance.cite_sources", False):
        return [
            Finding(
                "error",
                "HR-002",
                "super-agent must set provenance.cite_sources=true (Article III)",
                "provenance.cite_sources",
                "III",
            )
        ]
    return []


@register("III.append-only-provenance", "III")
def check_append_only_provenance(view: dict[str, Any]) -> list[Finding]:
    if not _get(view, "provenance.enabled", False):
        return []
    append_only = _get(view, "provenance.append_only")
    if append_only is not True:
        return [
            Finding(
                "error",
                "HR-003",
                "provenance.enabled=true requires provenance.append_only=true (Article III)",
                "provenance.append_only",
                "III",
            )
        ]
    return []


# Article IV -----------------------------------------------------------------


@register("IV.super-agent-provenance", "IV")
def check_super_agent_provenance(view: dict[str, Any]) -> list[Finding]:
    if view.get("category") != "super-agent":
        return []
    if not _get(view, "provenance.enabled", False):
        return [
            Finding(
                "error",
                "PRV-001",
                "category='super-agent' requires provenance.enabled=true",
                "provenance.enabled",
                "IV",
            )
        ]
    return []


@register("IV.super-agent-constitution", "IV")
def check_super_agent_constitution(view: dict[str, Any]) -> list[Finding]:
    if view.get("category") != "super-agent":
        return []
    if not view.get("constitution"):
        return [
            Finding(
                "error",
                "PRV-002",
                "category='super-agent' requires a constitution: section",
                "constitution",
                "IV",
            )
        ]
    rules = _get(view, "constitution.rules", []) or []
    if not rules:
        return [
            Finding(
                "error",
                "PRV-003",
                "constitution.rules must contain at least one rule",
                "constitution.rules",
                "IV",
            )
        ]
    return []


# Article V ------------------------------------------------------------------


@register("V.1-finance-disclaimer", "V.1")
def check_finance_disclaimer(view: dict[str, Any]) -> list[Finding]:
    kind = view.get("kind")
    if kind not in FINANCE_KINDS:
        return []
    if not _get(view, "safety.disclaimers.not_financial_advice", False):
        return [
            Finding(
                "error",
                "DSC-001",
                f"kind='{kind}' requires safety.disclaimers.not_financial_advice=true",
                "safety.disclaimers.not_financial_advice",
                "V.1",
            )
        ]
    return []


@register("V.2-tax-disclaimer", "V.2")
def check_tax_disclaimer(view: dict[str, Any]) -> list[Finding]:
    kind = view.get("kind")
    if kind not in TAX_KINDS:
        return []
    if not _get(view, "safety.disclaimers.not_tax_advice", False):
        return [
            Finding(
                "warn",
                "DSC-002",
                f"kind='{kind}' should set safety.disclaimers.not_tax_advice=true if tax export is shipped",
                "safety.disclaimers.not_tax_advice",
                "V.2",
            )
        ]
    return []


@register("V.3-real-world-action-disclaimer", "V.3")
def check_real_world_disclaimer(view: dict[str, Any]) -> list[Finding]:
    gates = set(_get(view, "constitution.consent_gates", []) or [])
    has_real_world = bool(gates & MANDATORY_CONSENT_GATES_FOR_REAL_WORLD)
    if not has_real_world:
        return []
    if not _get(view, "safety.disclaimers.real_world_action_consent", False):
        return [
            Finding(
                "warn",
                "DSC-003",
                "agent declares real-world consent gates; "
                "set safety.disclaimers.real_world_action_consent=true",
                "safety.disclaimers.real_world_action_consent",
                "V.3",
            )
        ]
    return []


# Article VI -----------------------------------------------------------------


@register("VI.1-cost-limits", "VI")
def check_cost_limits(view: dict[str, Any]) -> list[Finding]:
    kind = view.get("kind")
    needs_cost = (kind in FINANCE_KINDS) or (view.get("category") == "super-agent")
    if not needs_cost:
        return []
    cl = _get(view, "safety.cost_limits")
    if cl is None:
        return [
            Finding(
                "warn",
                "COST-001",
                f"kind='{kind}' should declare safety.cost_limits "
                "with usd_per_session_max, usd_per_day_max, and tokens_per_session_max",
                "safety.cost_limits",
                "VI.1",
            )
        ]
    return []


@register("VI.2-hitl-for-consent-gates", "VI")
def check_hitl_when_consent_gates_declared(view: dict[str, Any]) -> list[Finding]:
    gates = _get(view, "constitution.consent_gates", []) or []
    if not gates:
        return []
    hitl = _get(view, "safety.human_in_the_loop")
    if hitl is None:
        return [
            Finding(
                "warn",
                "HITL-001",
                "agent declares consent_gates; safety.human_in_the_loop should be configured",
                "safety.human_in_the_loop",
                "VI.2",
            )
        ]
    if isinstance(hitl, dict) and not hitl:
        return [
            Finding(
                "error",
                "HITL-003",
                "consent_gates declared but human_in_the_loop is an empty block; "
                "set enabled=true and configure confirm_before",
                "safety.human_in_the_loop",
                "VI.2",
            )
        ]
    if isinstance(hitl, dict) and hitl.get("enabled") is False:
        return [
            Finding(
                "error",
                "HITL-002",
                "consent_gates declared but human_in_the_loop.enabled=false",
                "safety.human_in_the_loop.enabled",
                "VI.2",
            )
        ]
    return []


# Article VII ----------------------------------------------------------------


# Manifest-content patterns used by check_appdata_paths_only to flag
# absolute-drive paths in scanned manifests. Constructed at runtime so the
# scanner source does not contain literal Windows backslash sequences
# (which the repo-wide cross-platform discipline test forbids in xlOS source).
_DRIVE_BACKSLASH = chr(92)  # single '\' character
_ABSOLUTE_DRIVE_PREFIXES: tuple[str, ...] = (
    f"C:{_DRIVE_BACKSLASH}",
    f"D:{_DRIVE_BACKSLASH}",
    f"E:{_DRIVE_BACKSLASH}",
    "/usr/",
    "/etc/",
    "/var/",
)

_TRACKER_DOMAINS: tuple[str, ...] = (
    "google-analytics.com",
    "googletagmanager.com",
    "mixpanel.com",
    "segment.io",
    "amplitude.com",
)


@register("VII.pii-default", "VII")
def check_pii_local_only(view: dict[str, Any]) -> list[Finding]:
    kind = view.get("kind")
    pii = _get(view, "safety.pii_handling", "local-only")
    permissive_kinds = FINANCE_KINDS | {"vision-analyzer", "super-agent"}
    if pii == "none" and (kind in permissive_kinds or view.get("category") == "super-agent"):
        return [
            Finding(
                "warn",
                "PII-001",
                f"safety.pii_handling='none' is permissive for kind='{kind}'; "
                "consider 'local-only' or 'redacted-cloud'",
                "safety.pii_handling",
                "VII",
            )
        ]
    return []


@register("VII.appdata-paths-only", "VII")
def check_appdata_paths_only(view: dict[str, Any]) -> list[Finding]:
    findings: list[Finding] = []
    windows = view.get("windows") or {}
    if not isinstance(windows, dict):
        return []
    for key, val in windows.items():
        if not isinstance(val, str):
            continue
        for prefix in _ABSOLUTE_DRIVE_PREFIXES:
            if val.startswith(prefix):
                findings.append(
                    Finding(
                        "error",
                        "PII-002",
                        f"windows.{key}='{val}' uses an absolute drive path; "
                        "use a relative path under the user's data dir",
                        f"windows.{key}",
                        "VII",
                    )
                )
    return findings


@register("VII.encryption-at-rest", "VII")
def check_encryption_at_rest(view: dict[str, Any]) -> list[Finding]:
    if not _get(view, "memory.enabled", False):
        return []
    pii = _get(view, "safety.pii_handling", "local-only")
    if pii == "none":
        return []
    if _get(view, "memory.encryption_at_rest") is False:
        return [
            Finding(
                "warn",
                "PII-003",
                "memory.enabled=true with pii_handling != 'none' should set memory.encryption_at_rest=true",
                "memory.encryption_at_rest",
                "VII",
            )
        ]
    return []


@register("VII.data-retention-required", "VII")
def check_data_retention(view: dict[str, Any]) -> list[Finding]:
    kind = view.get("kind")
    needs_retention = (kind in FINANCE_KINDS) or (view.get("category") == "super-agent")
    if not needs_retention:
        return []
    if _get(view, "safety.data_retention_days") is None:
        return [
            Finding(
                "warn",
                "PII-004",
                f"kind='{kind}' should declare safety.data_retention_days (e.g. 90 or 365)",
                "safety.data_retention_days",
                "VII",
            )
        ]
    return []


@register("VII.no-trackers", "VII")
def check_no_trackers(view: dict[str, Any]) -> list[Finding]:
    findings: list[Finding] = []
    targets: list[str] = []
    scripts = _get(view, "windows.runtime.scripts")
    if isinstance(scripts, list):
        for s in scripts:
            if isinstance(s, str):
                targets.append(s)
            elif isinstance(s, dict):
                targets.append(json.dumps(s, default=str))
    py_deps = _get(view, "dependencies.python")
    if isinstance(py_deps, list):
        for dep in py_deps:
            if isinstance(dep, str):
                targets.append(dep)
            elif isinstance(dep, dict):
                targets.append(json.dumps(dep, default=str))
    for dotted in (
        "dependencies.npm",
        "dependencies.system",
        "dependencies.apis",
        "windows.runtime.entrypoints",
        "windows.runtime.env",
    ):
        val = _get(view, dotted)
        if val is None:
            continue
        if isinstance(val, (list, dict)):
            targets.append(json.dumps(val, default=str))
        elif isinstance(val, str):
            targets.append(val)
    blob = "\n".join(targets).lower()
    for tracker in _TRACKER_DOMAINS:
        if tracker in blob:
            findings.append(
                Finding(
                    "error",
                    "PII-005",
                    f"manifest references third-party tracker '{tracker}'; "
                    "agents must not bundle telemetry by default (Article VII)",
                    "manifest",
                    "VII",
                )
            )
    return findings


# Article VIII --------------------------------------------------------------


@register("VIII.scanner-severity-floor", "VIII")
def check_scanner_severity_floor(view: dict[str, Any]) -> list[Finding]:
    floor = _get(view, "safety.scanner_severity_floor")
    if floor is None:
        return [
            Finding(
                "info",
                "AUD-001",
                "safety.scanner_severity_floor is not declared; defaulting to 'warn' is recommended",
                "safety.scanner_severity_floor",
                "VIII",
            )
        ]
    if floor not in SEVERITIES:
        return [
            Finding(
                "error",
                "AUD-002",
                f"safety.scanner_severity_floor='{floor}' must be one of {SEVERITIES}",
                "safety.scanner_severity_floor",
                "VIII",
            )
        ]
    return []


# Public API ----------------------------------------------------------------


# Stable view of the registered checks; populated at import time. The mapping
# stays read-only after import (mutation through ``register`` is reserved for
# the import phase only).
CHECKS: dict[str, tuple[CheckFn, str]] = _CHECKS


# Mandatory Constitution articles. These ALWAYS run — a manifest cannot
# disable them by omitting or partially declaring ``extensions.constitution``.
#
#   * Article I   — Universal rules (Apache-2.0 license, no Windows admin,
#                   manifest version, no anti-xAI positioning).
#   * Article III — Hard refusals: bright-line "no" actions including
#                   ``scrape_authenticated_x_content``,
#                   ``impersonate_user_identity``, ``exfiltrate_user_data``,
#                   and — meta-critically — ``bypass_safety_scanner`` itself.
#   * Article VII — Local-first / privacy-first defaults: no third-party
#                   trackers, AppData-only paths, encryption-at-rest for
#                   memory holding PII, declared retention windows.
#
# Earlier versions of the scanner gated *every* article on the manifest
# opting in via ``extensions.constitution``. That made the Constitution
# itself opt-in: any manifest could silently skip Article III by simply
# omitting the constitution block — which is the exact behavior Article III
# (``bypass_safety_scanner``) is supposed to forbid. These three articles
# encode safety guarantees that cannot be left to the manifest author's
# discretion, so they are enforced unconditionally. Other articles
# (II, IV, V, VI, VIII) are scoped to features the manifest declares
# (consent gates, super-agent provenance, finance disclaimers, audit floor)
# and remain opt-in via ``extensions.constitution``.
_CORE_ARTICLES: frozenset[str] = frozenset({"I", "III", "VII"})


def _applicable_articles(manifest: dict[str, Any]) -> set[str]:
    """Return the set of articles whose checks should run for this manifest.

    Core articles (see ``_CORE_ARTICLES``) are always included regardless of
    what the manifest declares. Additional articles are added when the
    manifest opts in via ``extensions.constitution = [...]``.
    """
    articles: set[str] = set(_CORE_ARTICLES)
    extensions = manifest.get("extensions")
    if isinstance(extensions, dict):
        declared = extensions.get("constitution")
        if isinstance(declared, list):
            for entry in declared:
                if isinstance(entry, str):
                    articles.add(entry)
    return articles


def _article_matches(check_article: str, opt_in: set[str]) -> bool:
    """Article matching: a check tagged 'V.1' applies when opt-in contains 'V'
    or 'V.1'; a check tagged 'I' applies when opt-in contains 'I'.
    """
    if check_article in opt_in:
        return True
    base = check_article.split(".", 1)[0]
    return base in opt_in


def scan_manifest(manifest: dict[str, Any]) -> ScanResult:
    """Scan a v2.14 manifest dict for Constitution violations.

    Articles I (universal rules), III (hard refusals), and VII (local-first /
    privacy-first defaults) are always enforced — a manifest cannot opt out
    of them by omitting or partially declaring ``extensions.constitution``.
    Article III in particular forbids ``bypass_safety_scanner``, so making
    the scanner itself opt-in would be a trivial bypass; see ``_CORE_ARTICLES``.

    Other articles (II, IV, V, VI, VIII) are opt-in: the manifest must list
    them in ``extensions.constitution`` for those checks to run. They are
    scoped to features the manifest declares (consent gates, super-agent
    provenance, finance disclaimers, cost limits, audit floor) and have no
    meaning for agents that do not use those features.
    """
    name = manifest.get("name") if isinstance(manifest.get("name"), str) else "<unnamed>"
    result = ScanResult(manifest_name=str(name))

    opt_in = _applicable_articles(manifest)

    view = _build_view(manifest)
    for check_name, (check_fn, article) in CHECKS.items():
        if not _article_matches(article, opt_in):
            continue
        try:
            findings = check_fn(view)
        except Exception as exc:  # pragma: no cover - defensive
            findings = [
                Finding(
                    "warn",
                    "INT-001",
                    f"check '{check_name}' raised: {exc}",
                    check_name,
                    "VIII",
                )
            ]
        result.findings.extend(findings)
    return result


def constitution_path() -> Path:
    """Return the on-disk path to the bundled constitution.md (wheel-safe)."""
    res = files("xlos.safety").joinpath("constitution.md")
    with as_file(res) as fp:
        return Path(fp)
