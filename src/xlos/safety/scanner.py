"""Constitution safety scanner for xlOS.

Ported from grok-agent's safety/scanner.py with two semantic changes for xlOS:

1. Scans are scoped per ``extensions.constitution`` declared on the manifest.
   Agents that do not declare any article do not get any Constitution checks
   (returns an empty result). This is the inverse of the source scanner, which
   ran every check on every agent regardless of declared rules.
2. Module-style API: ``scan_manifest(manifest: dict) -> ScanResult``. The
   source scanner was CLI-oriented; this version is library-first so the
   xlOS install pipeline can call it directly.

Checks are keyed by Constitution article (Roman numeral, optionally with a
subsection). Articles are declared in ``extensions.constitution`` as either
an array (``["II", "V.1"]``) or a dotted/dict shape (``{rules: [...]}``).
Unknown article references are tolerated.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import Any, Callable

__all__ = [
    "Finding",
    "ScanResult",
    "scan_manifest",
    "registered_articles",
]


SEVERITIES = ("info", "warn", "error")
_SEVERITY_RANK = {"info": 0, "warn": 1, "error": 2}

_FINANCE_CATEGORIES = {"x-money-tool"}
_SUPER_CATEGORIES = {"super-agent"}


@dataclass(frozen=True)
class Finding:
    """A single Constitution check result."""

    severity: str
    code: str
    message: str
    location: str = ""
    article: str = ""

    def __post_init__(self) -> None:
        if self.severity not in SEVERITIES:
            raise ValueError(f"Bad severity: {self.severity}")


@dataclass
class ScanResult:
    """Aggregate of zero or more findings produced by ``scan_manifest``."""

    findings: list[Finding] = field(default_factory=list)
    articles_checked: list[str] = field(default_factory=list)

    @property
    def max_severity(self) -> str:
        if not self.findings:
            return "info"
        return max(self.findings, key=lambda f: _SEVERITY_RANK[f.severity]).severity

    @property
    def has_high_severity(self) -> bool:
        """True when any finding is error-level."""
        return any(f.severity == "error" for f in self.findings)

    def by_article(self, article: str) -> list[Finding]:
        return [f for f in self.findings if f.article == article]


CheckFn = Callable[[dict[str, Any]], list[Finding]]
_CHECKS: dict[str, CheckFn] = {}


def _register(article: str) -> Callable[[CheckFn], CheckFn]:
    def deco(fn: CheckFn) -> CheckFn:
        _CHECKS[article] = fn
        return fn

    return deco


def _get(d: dict[str, Any], dotted: str, default: Any = None) -> Any:
    cur: Any = d
    for part in dotted.split("."):
        if not isinstance(cur, dict):
            return default
        cur = cur.get(part)
        if cur is None:
            return default
    return cur


def _ext(manifest: dict[str, Any]) -> dict[str, Any]:
    ext = manifest.get("extensions")
    return ext if isinstance(ext, dict) else {}


def _declared_articles(manifest: dict[str, Any]) -> list[str]:
    """Extract the article refs declared on the manifest.

    Accepts both shapes per the vendored v2.14 schema:
        extensions.constitution: ["II", "V.1"]
        extensions.constitution: {"articles": ["II", "V.1"]}
    """
    raw = _ext(manifest).get("constitution")
    if isinstance(raw, list):
        return [str(a) for a in raw if isinstance(a, (str, int, float))]
    if isinstance(raw, dict):
        arts = raw.get("articles")
        if isinstance(arts, list):
            return [str(a) for a in arts if isinstance(a, (str, int, float))]
    return []


# ---------------------------------------------------------------------------
# Article I — Universal Rules
# ---------------------------------------------------------------------------


@_register("I")
def _check_article_i(m: dict[str, Any]) -> list[Finding]:
    """Article I: license + xAI ecosystem positioning."""
    findings: list[Finding] = []
    desc = (m.get("description") or "").lower()
    forbidden = (
        "compete with xai",
        "replace xai",
        "alternative to grok",
        "replacement for grok",
        "anti-xai",
    )
    for term in forbidden:
        if term in desc:
            findings.append(
                Finding(
                    "error",
                    "POS-001",
                    f"description contains forbidden positioning '{term}' (Article I)",
                    location="description",
                    article="I",
                )
            )
    return findings


# ---------------------------------------------------------------------------
# Article II — Consent Gates
# ---------------------------------------------------------------------------


@_register("II")
def _check_article_ii(m: dict[str, Any]) -> list[Finding]:
    """Article II: consent gates must be declared for real-world actions."""
    findings: list[Finding] = []
    multi = _ext(m).get("multi_agent_roles") or {}
    if isinstance(multi, dict):
        gates = multi.get("consent_gates") or []
    else:
        gates = []
    if not isinstance(gates, list):
        gates = []

    # Agents with publish/post tools should declare a publish gate.
    tools = m.get("tools") or []
    has_post_tool = False
    if isinstance(tools, list):
        for t in tools:
            if not isinstance(t, dict):
                continue
            name = (t.get("name") or "").lower()
            desc = (t.get("description") or "").lower()
            if "publish" in name or "publish" in desc or "post_to_x" in name:
                has_post_tool = True
                break
    if has_post_tool and not any("publish" in str(g) for g in gates):
        findings.append(
            Finding(
                "warn",
                "CG-001",
                "tool implies publish-to-X behaviour but no 'publish_to_x' consent gate "
                "is declared in extensions.multi_agent_roles.consent_gates",
                location="extensions.multi_agent_roles.consent_gates",
                article="II",
            )
        )
    return findings


# ---------------------------------------------------------------------------
# Article III — Hard Refusals
# ---------------------------------------------------------------------------


_HARD_REFUSAL_BLACKLIST = {
    "scrape_authenticated_x_content",
    "impersonate_user_identity",
    "bypass_safety_scanner",
    "exfiltrate_user_data",
}


@_register("III")
def _check_article_iii(m: dict[str, Any]) -> list[Finding]:
    findings: list[Finding] = []
    multi = _ext(m).get("multi_agent_roles") or {}
    gates = multi.get("consent_gates") if isinstance(multi, dict) else None
    if not isinstance(gates, list):
        gates = []
    blacklisted = set(gates) & _HARD_REFUSAL_BLACKLIST
    for action in sorted(blacklisted):
        findings.append(
            Finding(
                "error",
                "HR-001",
                f"'{action}' is on the hard-refusal blacklist (Article III)",
                location="extensions.multi_agent_roles.consent_gates",
                article="III",
            )
        )
    return findings


# ---------------------------------------------------------------------------
# Article IV — Provenance & Truth
# ---------------------------------------------------------------------------


@_register("IV")
def _check_article_iv(m: dict[str, Any]) -> list[Finding]:
    findings: list[Finding] = []
    category = m.get("category")
    prov = _ext(m).get("provenance")
    if category in _SUPER_CATEGORIES:
        if not isinstance(prov, dict) or prov.get("enabled") is False:
            findings.append(
                Finding(
                    "error",
                    "PRV-001",
                    "super-agent requires extensions.provenance.enabled=true (Article IV)",
                    location="extensions.provenance.enabled",
                    article="IV",
                )
            )
        elif isinstance(prov, dict) and prov.get("cite_sources") is False:
            findings.append(
                Finding(
                    "error",
                    "PRV-002",
                    "super-agent requires extensions.provenance.cite_sources=true (Article IV)",
                    location="extensions.provenance.cite_sources",
                    article="IV",
                )
            )
    return findings


# ---------------------------------------------------------------------------
# Article V — Disclaimers
# ---------------------------------------------------------------------------


@_register("V")
def _check_article_v(m: dict[str, Any]) -> list[Finding]:
    findings: list[Finding] = []
    category = m.get("category")
    if category in _FINANCE_CATEGORIES:
        xm = _ext(m).get("x_money_specific") or {}
        discl = xm.get("disclaimers") or {}
        if not discl.get("not_financial_advice"):
            findings.append(
                Finding(
                    "error",
                    "DSC-001",
                    "x-money-tool requires "
                    "extensions.x_money_specific.disclaimers.not_financial_advice=true (Article V.1)",
                    location="extensions.x_money_specific.disclaimers.not_financial_advice",
                    article="V",
                )
            )
    return findings


@_register("V.1")
def _check_article_v_1(m: dict[str, Any]) -> list[Finding]:
    return _check_article_v(m)


@_register("V.2")
def _check_article_v_2(m: dict[str, Any]) -> list[Finding]:
    findings: list[Finding] = []
    category = m.get("category")
    if category in _FINANCE_CATEGORIES:
        xm = _ext(m).get("x_money_specific") or {}
        discl = xm.get("disclaimers") or {}
        if discl.get("not_tax_advice") is False:
            findings.append(
                Finding(
                    "warn",
                    "DSC-002",
                    "x-money-tool with tax export should declare not_tax_advice=true (Article V.2)",
                    location="extensions.x_money_specific.disclaimers.not_tax_advice",
                    article="V.2",
                )
            )
    return findings


# ---------------------------------------------------------------------------
# Article VI — Cost Limits & HITL
# ---------------------------------------------------------------------------


@_register("VI")
def _check_article_vi(m: dict[str, Any]) -> list[Finding]:
    findings: list[Finding] = []
    category = m.get("category")
    if category in _FINANCE_CATEGORIES or category in _SUPER_CATEGORIES:
        if m.get("cost_limits") is None:
            findings.append(
                Finding(
                    "warn",
                    "COST-001",
                    f"category='{category}' should declare top-level cost_limits (Article VI)",
                    location="cost_limits",
                    article="VI",
                )
            )
    return findings


# ---------------------------------------------------------------------------
# Article VII — Local-First & Privacy-First
# ---------------------------------------------------------------------------


_ABSOLUTE_DRIVE_PATTERNS = (r"C:" + chr(92), r"D:" + chr(92), "/usr/", "/etc/", "/var/")
_TRACKER_DOMAINS = (
    "google-analytics.com",
    "googletagmanager.com",
    "mixpanel.com",
    "segment.io",
    "amplitude.com",
)


@_register("VII")
def _check_article_vii(m: dict[str, Any]) -> list[Finding]:
    findings: list[Finding] = []
    # Walk the manifest for absolute paths + tracker references.
    text_blob = _serialize(m).lower()
    for prefix in _ABSOLUTE_DRIVE_PATTERNS:
        if prefix.lower() in text_blob:
            findings.append(
                Finding(
                    "error",
                    "PII-002",
                    f"manifest references absolute path prefix '{prefix}' (Article VII — use relative paths)",
                    location="manifest",
                    article="VII",
                )
            )
            break
    for tracker in _TRACKER_DOMAINS:
        if tracker in text_blob:
            findings.append(
                Finding(
                    "error",
                    "PII-005",
                    f"manifest references third-party tracker '{tracker}' (Article VII)",
                    location="manifest",
                    article="VII",
                )
            )
    return findings


# ---------------------------------------------------------------------------
# Article VIII — Enforcement (audit hooks)
# ---------------------------------------------------------------------------


_FORBIDDEN_PHRASES_RE = re.compile(
    r"\betc\.|and so on|anything related to|as you see fit|use your judgment",
    re.IGNORECASE,
)


@_register("VIII")
def _check_article_viii(m: dict[str, Any]) -> list[Finding]:
    findings: list[Finding] = []
    text_blob = _serialize(m)
    for line in text_blob.splitlines():
        if _FORBIDDEN_PHRASES_RE.search(line):
            findings.append(
                Finding(
                    "warn",
                    "AUD-001",
                    f"manifest contains vague language: {line.strip()[:80]} (Article VIII)",
                    location="manifest",
                    article="VIII",
                )
            )
            break
    return findings


# ---------------------------------------------------------------------------
# Article IX — Amendment & Versioning (informational)
# ---------------------------------------------------------------------------


@_register("IX")
def _check_article_ix(m: dict[str, Any]) -> list[Finding]:
    # No machine-checkable rule today. Return empty list (the article is still
    # registered so manifests can declare it without falling through to
    # 'unknown article').
    _ = m
    return []


# ---------------------------------------------------------------------------
# Driver
# ---------------------------------------------------------------------------


def _serialize(m: dict[str, Any]) -> str:
    """Render a manifest as a flat string for substring checks."""
    import json as _json

    return _json.dumps(m, default=str)


def registered_articles() -> list[str]:
    """Return the sorted list of Constitution articles the scanner knows about."""
    return sorted(_CHECKS.keys())


def scan_manifest(manifest: dict[str, Any]) -> ScanResult:
    """Run the Constitution scanner against a parsed manifest mapping.

    Returns an empty :class:`ScanResult` when the manifest does not declare any
    ``extensions.constitution`` article — those agents are not subject to
    Constitution checks by design.

    Articles that are declared but unknown to the scanner are recorded in
    ``articles_checked`` but produce no findings, so future Constitution
    additions in the source repo do not block migration here.
    """
    result = ScanResult()
    if not isinstance(manifest, dict):
        return result

    declared = _declared_articles(manifest)
    if not declared:
        return result

    for article in declared:
        result.articles_checked.append(article)
        check = _CHECKS.get(article)
        if check is None:
            # Article declared but not implemented; that is allowed and is
            # captured at the manifest level via 'articles_checked'.
            continue
        try:
            result.findings.extend(check(manifest))
        except Exception as exc:  # pragma: no cover — defensive
            result.findings.append(
                Finding(
                    "warn",
                    "INT-001",
                    f"check '{article}' raised: {exc}",
                    location=article,
                    article=article,
                )
            )
    return result
