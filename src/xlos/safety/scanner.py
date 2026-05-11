# Copyright 2026 AgentMindCloud
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#     http://www.apache.org/licenses/LICENSE-2.0
"""xlOS Constitution safety scanner.

Layered safety enforcement on top of the v2.14 schema validator:
the schema (``spec/v2.14/schema.json``) checks structure; this scanner checks
the Agent Constitution (``src/xlos/safety/constitution.md``) -- the rules
about what an agent is allowed to *do*.

Severity model:
    info  -- recommended-but-not-required
    warn  -- should-fix; non-blocking
    error -- Constitution violation; install / merge blocked

Usage::

    from xlos.safety.scanner import scan_manifest
    result = scan_manifest(manifest)
    if result.has_errors:
        ...

Article scoping: each manifest declares which articles apply via
``extensions.constitution`` (either ``articles: [I, II, ...]`` or by deriving
article references from rule text). Agents without ``extensions.constitution``
are skipped entirely (scan_manifest returns an empty result for them) -- they
are not Constitution-checked agents.
"""
from __future__ import annotations

import re
from dataclasses import asdict, dataclass, field
from typing import Any, Callable, Dict, List, Tuple

__all__ = [
    "Finding",
    "ScanResult",
    "scan_manifest",
    "CHECKS",
    "SEVERITIES",
    "SEVERITY_RANK",
]


# ----------------------------------------------------------------------------
# Constants
# ----------------------------------------------------------------------------

SEVERITIES: Tuple[str, ...] = ("info", "warn", "error")
SEVERITY_RANK: Dict[str, int] = {"info": 0, "warn": 1, "error": 2}

# Categories that ship under the finance / x-money umbrella.
FINANCE_CATEGORIES: frozenset[str] = frozenset({"x-money-tool"})

# Mandatory real-world consent gates per Article II.
MANDATORY_CONSENT_GATES_FOR_REAL_WORLD: frozenset[str] = frozenset(
    {
        "publish_to_x",
        "send_dm",
        "move_funds",
        "pay_real_money",
        "modify_local_files_outside_appdata",
    }
)

# Categorical refusals -- never allowed as consent gates (Article III).
HARD_REFUSAL_BLACKLIST: frozenset[str] = frozenset(
    {
        "scrape_authenticated_x_content",
        "impersonate_user_identity",
        "bypass_safety_scanner",
        "exfiltrate_user_data",
    }
)

# Forbidden positioning phrases (Article I.2).
FORBIDDEN_POSITIONING_TERMS: Tuple[str, ...] = (
    "compete with xai",
    "replace xai",
    "alternative to grok",
    "replacement for grok",
    "anti-xai",
)

# Real-world verb prefixes (Article II.action-gate-confirm-list).
REAL_WORLD_VERBS: Tuple[str, ...] = (
    "publish_",
    "send_",
    "move_",
    "pay_",
    "delete_",
    "modify_",
)


# ----------------------------------------------------------------------------
# Finding / ScanResult model
# ----------------------------------------------------------------------------


@dataclass
class Finding:
    """A single Constitution-violation finding."""

    severity: str  # "info" | "warn" | "error"
    code: str
    message: str
    location: str = ""
    article: str = ""

    def __post_init__(self) -> None:
        if self.severity not in SEVERITIES:
            raise ValueError(f"Bad severity: {self.severity!r}")

    def to_json(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class ScanResult:
    """The outcome of scanning a single manifest."""

    findings: List[Finding] = field(default_factory=list)
    applicable_articles: List[str] = field(default_factory=list)
    skipped: bool = False  # True when manifest has no extensions.constitution

    @property
    def max_severity(self) -> str:
        if not self.findings:
            return "info"
        return max(self.findings, key=lambda f: SEVERITY_RANK[f.severity]).severity

    @property
    def has_errors(self) -> bool:
        return any(f.severity == "error" for f in self.findings)

    @property
    def has_high_severity(self) -> bool:
        """True if any finding is severity 'error' (synonym for has_errors)."""
        return self.has_errors

    def filter_by_floor(self, floor: str) -> List[Finding]:
        threshold = SEVERITY_RANK[floor]
        return [f for f in self.findings if SEVERITY_RANK[f.severity] >= threshold]


# ----------------------------------------------------------------------------
# Helpers
# ----------------------------------------------------------------------------


def _get(d: Dict[str, Any], dotted: str, default: Any = None) -> Any:
    """Safely traverse a nested dict by dotted path. Returns default on miss."""
    cur: Any = d
    for part in dotted.split("."):
        if not isinstance(cur, dict):
            return default
        cur = cur.get(part)
        if cur is None:
            return default
    return cur


def _normalize_article(art: str) -> str:
    """Normalize article ref: 'I', 'I.1', 'II', etc. (uppercased, no extras)."""
    return str(art).strip().upper()


def _declared_articles(manifest: Dict[str, Any]) -> List[str]:
    """Articles this manifest declares it is bound to.

    Reads ``extensions.constitution`` in this order:
      1. If it has an ``articles`` array, use that verbatim.
      2. Else parse ``rules`` text for "Article X" references.
      3. Else return [].
    """
    const = _get(manifest, "extensions.constitution")
    if not isinstance(const, (dict, list)):
        return []
    if isinstance(const, list):
        return [_normalize_article(a) for a in const if isinstance(a, str)]
    # dict form
    arts = const.get("articles")
    if isinstance(arts, list):
        return [_normalize_article(a) for a in arts if isinstance(a, str)]
    rules = const.get("rules")
    if isinstance(rules, list):
        seen: List[str] = []
        for r in rules:
            if not isinstance(r, str):
                continue
            for art in re.findall(r"Article ([IVX]+(?:\.\d+)?)", r):
                norm = _normalize_article(art)
                if norm not in seen:
                    seen.append(norm)
        return seen
    return []


# ----------------------------------------------------------------------------
# Check registry: each check declares the article(s) it covers
# ----------------------------------------------------------------------------


CheckFn = Callable[[Dict[str, Any]], List[Finding]]
CHECKS: Dict[str, Tuple[Tuple[str, ...], CheckFn]] = {}


def _register(name: str, articles: Tuple[str, ...]) -> Callable[[CheckFn], CheckFn]:
    def deco(fn: CheckFn) -> CheckFn:
        CHECKS[name] = (articles, fn)
        return fn

    return deco


def _article_matches(declared: List[str], required: Tuple[str, ...]) -> bool:
    """A check applies if any of its required articles (or a parent like 'I'
    when 'I.1' is declared) is present in declared."""
    if not required:
        return True
    declared_set = set(declared)
    # Build parent-set: "I.1" implies "I", "II.3" implies "II", etc.
    parents = {a.split(".")[0] for a in declared if "." in a}
    for need in required:
        if need in declared_set:
            return True
        if need in parents:
            return True
        # If check says "I" and declared has "I.1", also match.
        if any(d.startswith(need + ".") for d in declared_set):
            return True
    return False


# ----------------------------------------------------------------------------
# Checks
# ----------------------------------------------------------------------------


@_register("I.1-license", ("I",))
def check_license(m: Dict[str, Any]) -> List[Finding]:
    """If license is declared, it must be 'Apache-2.0'. (Optional field.)"""
    lic = m.get("license")
    if lic is None:
        return []
    if lic != "Apache-2.0":
        return [
            Finding(
                "error",
                "LIC-002",
                f"license must be 'Apache-2.0', got {lic!r}",
                "license",
                "I.1",
            )
        ]
    return []


@_register("I.2-xai-positioning", ("I", "I.2"))
def check_xai_positioning(m: Dict[str, Any]) -> List[Finding]:
    findings: List[Finding] = []
    desc = (m.get("description") or "").lower()
    tagline = (_get(m, "extensions.metadata.tagline") or "").lower()
    blob = desc + " | " + tagline
    for term in FORBIDDEN_POSITIONING_TERMS:
        if term in blob:
            findings.append(
                Finding(
                    "error",
                    "POS-001",
                    f"description / metadata.tagline contains forbidden positioning {term!r}",
                    "description",
                    "I.2",
                )
            )
    return findings


@_register("II.publish-gate", ("II",))
def check_publish_consent_gate(m: Dict[str, Any]) -> List[Finding]:
    rt = m.get("real_time_x") or {}
    gates = _get(m, "extensions.constitution.consent_gates", []) or []
    if rt.get("posts") and "publish_to_x" not in gates:
        return [
            Finding(
                "error",
                "CG-002",
                "real_time_x.posts=true requires 'publish_to_x' in extensions.constitution.consent_gates",
                "extensions.constitution.consent_gates",
                "II",
            )
        ]
    return []


@_register("II.action-gate-confirm-list", ("II",))
def check_action_gate_confirm_list(m: Dict[str, Any]) -> List[Finding]:
    gates = _get(m, "extensions.constitution.consent_gates", []) or []
    confirm_before = (
        _get(m, "extensions.safety_policy.human_in_the_loop.confirm_before", []) or []
    )
    findings: List[Finding] = []
    for gate in gates:
        if not isinstance(gate, str):
            continue
        if any(gate.startswith(v) for v in REAL_WORLD_VERBS):
            if gate not in confirm_before:
                findings.append(
                    Finding(
                        "warn",
                        "CG-003",
                        f"consent gate {gate!r} looks like a real-world action; "
                        f"add it to extensions.safety_policy.human_in_the_loop.confirm_before",
                        "extensions.safety_policy.human_in_the_loop.confirm_before",
                        "II",
                    )
                )
    return findings


@_register("III.no-forbidden-actions-flipped", ("III",))
def check_forbidden_not_silently_allowed(m: Dict[str, Any]) -> List[Finding]:
    forbidden = set(_get(m, "extensions.safety_policy.forbidden_actions", []) or [])
    gates = set(_get(m, "extensions.constitution.consent_gates", []) or [])
    overlap = forbidden & gates
    return [
        Finding(
            "error",
            "HR-001",
            f"action {action!r} is in safety_policy.forbidden_actions AND constitution.consent_gates",
            "extensions.constitution.consent_gates",
            "III",
        )
        for action in overlap
    ]


@_register("III.hard-refusal-blacklist", ("III",))
def check_hard_refusal_blacklist(m: Dict[str, Any]) -> List[Finding]:
    gates = set(_get(m, "extensions.constitution.consent_gates", []) or [])
    blacklisted = gates & HARD_REFUSAL_BLACKLIST
    return [
        Finding(
            "error",
            "HR-008",
            f"action {action!r} is on the Article III hard-refusal blacklist",
            "extensions.constitution.consent_gates",
            "III",
        )
        for action in blacklisted
    ]


@_register("III.append-only-provenance", ("III",))
def check_append_only_provenance(m: Dict[str, Any]) -> List[Finding]:
    if not _get(m, "extensions.provenance.enabled", False):
        return []
    if _get(m, "extensions.provenance.append_only") is not True:
        return [
            Finding(
                "error",
                "HR-003",
                "extensions.provenance.enabled=true requires extensions.provenance.append_only=true",
                "extensions.provenance.append_only",
                "III",
            )
        ]
    return []


@_register("IV.super-agent-provenance", ("IV",))
def check_super_agent_provenance(m: Dict[str, Any]) -> List[Finding]:
    if m.get("category") != "super-agent":
        return []
    if not _get(m, "extensions.provenance.enabled", False):
        return [
            Finding(
                "error",
                "PRV-001",
                "category='super-agent' requires extensions.provenance.enabled=true",
                "extensions.provenance.enabled",
                "IV",
            )
        ]
    return []


@_register("IV.super-agent-constitution", ("IV",))
def check_super_agent_constitution(m: Dict[str, Any]) -> List[Finding]:
    if m.get("category") != "super-agent":
        return []
    rules = _get(m, "extensions.constitution.rules", []) or []
    if not rules:
        return [
            Finding(
                "error",
                "PRV-003",
                "extensions.constitution.rules must contain at least one rule",
                "extensions.constitution.rules",
                "IV",
            )
        ]
    return []


@_register("V.1-finance-disclaimer", ("V", "V.1"))
def check_finance_disclaimer(m: Dict[str, Any]) -> List[Finding]:
    cat = m.get("category")
    if cat not in FINANCE_CATEGORIES:
        return []
    if not _get(
        m, "extensions.x_money_specific.disclaimers.not_financial_advice", False
    ):
        return [
            Finding(
                "error",
                "DSC-001",
                f"category={cat!r} requires extensions.x_money_specific.disclaimers.not_financial_advice=true",
                "extensions.x_money_specific.disclaimers.not_financial_advice",
                "V.1",
            )
        ]
    return []


@_register("V.3-real-world-action-disclaimer", ("V", "V.3"))
def check_real_world_disclaimer(m: Dict[str, Any]) -> List[Finding]:
    gates = set(_get(m, "extensions.constitution.consent_gates", []) or [])
    if not (gates & MANDATORY_CONSENT_GATES_FOR_REAL_WORLD):
        return []
    if not _get(
        m, "extensions.x_money_specific.disclaimers.real_world_action_consent", False
    ) and not _get(m, "extensions.safety_policy.real_world_action_consent", False):
        return [
            Finding(
                "warn",
                "DSC-003",
                "agent declares real-world consent gates; declare a real_world_action_consent disclaimer",
                "extensions.x_money_specific.disclaimers.real_world_action_consent",
                "V.3",
            )
        ]
    return []


@_register("VI.1-cost-limits-for-finance-and-super-agent", ("VI", "VI.1"))
def check_cost_limits(m: Dict[str, Any]) -> List[Finding]:
    cat = m.get("category")
    needs_cost = (cat in FINANCE_CATEGORIES) or (cat == "super-agent")
    if not needs_cost:
        return []
    cl = m.get("cost_limits")
    if not isinstance(cl, dict):
        return [
            Finding(
                "warn",
                "COST-001",
                f"category={cat!r} should declare top-level cost_limits",
                "cost_limits",
                "VI.1",
            )
        ]
    return []


@_register("VI.2-hitl-for-consent-gated-agents", ("VI", "VI.2"))
def check_hitl_when_consent_gates_declared(m: Dict[str, Any]) -> List[Finding]:
    gates = _get(m, "extensions.constitution.consent_gates", []) or []
    if not gates:
        return []
    hitl = _get(m, "extensions.safety_policy.human_in_the_loop")
    if hitl is None:
        return [
            Finding(
                "warn",
                "HITL-001",
                "consent_gates declared; extensions.safety_policy.human_in_the_loop should be configured",
                "extensions.safety_policy.human_in_the_loop",
                "VI.2",
            )
        ]
    if isinstance(hitl, dict) and not hitl:
        return [
            Finding(
                "error",
                "HITL-003",
                "consent_gates declared but human_in_the_loop is an empty block",
                "extensions.safety_policy.human_in_the_loop",
                "VI.2",
            )
        ]
    if isinstance(hitl, dict) and hitl.get("enabled") is False:
        return [
            Finding(
                "error",
                "HITL-002",
                "consent_gates declared but human_in_the_loop.enabled=false",
                "extensions.safety_policy.human_in_the_loop.enabled",
                "VI.2",
            )
        ]
    return []


@_register("VII.pii-default", ("VII",))
def check_pii_local_only(m: Dict[str, Any]) -> List[Finding]:
    cat = m.get("category")
    pii = _get(m, "extensions.safety_policy.pii_handling", "local-only")
    if pii == "none" and (cat in FINANCE_CATEGORIES or cat == "super-agent"):
        return [
            Finding(
                "warn",
                "PII-001",
                f"extensions.safety_policy.pii_handling='none' is permissive for category={cat!r}",
                "extensions.safety_policy.pii_handling",
                "VII",
            )
        ]
    return []


@_register("VII.data-retention-required", ("VII",))
def check_data_retention(m: Dict[str, Any]) -> List[Finding]:
    cat = m.get("category")
    if cat not in FINANCE_CATEGORIES and cat != "super-agent":
        return []
    if _get(m, "extensions.safety_policy.data_retention_days") is None:
        return [
            Finding(
                "warn",
                "PII-004",
                f"category={cat!r} should declare extensions.safety_policy.data_retention_days",
                "extensions.safety_policy.data_retention_days",
                "VII",
            )
        ]
    return []


@_register("VIII.scanner-severity-floor", ("VIII",))
def check_scanner_severity_floor(m: Dict[str, Any]) -> List[Finding]:
    floor = _get(m, "extensions.safety_policy.scanner_severity_floor")
    if floor is None:
        return [
            Finding(
                "info",
                "AUD-001",
                "extensions.safety_policy.scanner_severity_floor is not declared",
                "extensions.safety_policy.scanner_severity_floor",
                "VIII",
            )
        ]
    if floor not in SEVERITIES:
        return [
            Finding(
                "error",
                "AUD-002",
                f"extensions.safety_policy.scanner_severity_floor={floor!r} must be one of {SEVERITIES}",
                "extensions.safety_policy.scanner_severity_floor",
                "VIII",
            )
        ]
    return []


@_register("VIII.severity-floor-not-info", ("VIII",))
def check_severity_floor_not_info(m: Dict[str, Any]) -> List[Finding]:
    cat = m.get("category")
    if cat not in FINANCE_CATEGORIES and cat != "super-agent":
        return []
    floor = _get(m, "extensions.safety_policy.scanner_severity_floor")
    if floor == "info":
        return [
            Finding(
                "warn",
                "AUD-003",
                f"category={cat!r} should not run with scanner_severity_floor='info'",
                "extensions.safety_policy.scanner_severity_floor",
                "VIII",
            )
        ]
    return []


# ----------------------------------------------------------------------------
# Public entry point
# ----------------------------------------------------------------------------


def scan_manifest(manifest: Dict[str, Any]) -> ScanResult:
    """Scan a parsed manifest dict for Constitution violations.

    Returns an empty ScanResult (skipped=True) for agents that do not declare
    ``extensions.constitution`` -- those are not Constitution-checked agents.
    Otherwise runs only the checks whose declared articles overlap with the
    manifest's ``extensions.constitution.articles`` (or articles parsed from
    rule text), accumulating Findings.
    """
    if not isinstance(manifest, dict):
        raise TypeError(f"manifest must be a dict, got {type(manifest).__name__}")

    declared = _declared_articles(manifest)
    if not declared:
        return ScanResult(skipped=True, applicable_articles=[])

    result = ScanResult(applicable_articles=list(declared))
    for name, (articles, fn) in CHECKS.items():
        if not _article_matches(declared, articles):
            continue
        try:
            findings = fn(manifest)
        except Exception as exc:  # check itself broke -- never block on that
            findings = [
                Finding(
                    "warn",
                    "INT-001",
                    f"check {name!r} raised: {exc}",
                    name,
                    "VIII",
                )
            ]
        result.findings.extend(findings)
    return result
