"""xlOS Constitution safety scanner.

Layered on top of the v2.14 schema validator: the schema (
``spec/v2.14/schema.json``) checks structure; this scanner checks the Agent
Constitution (``constitution.md``) — what an agent is permitted to *do*.

The scanner accepts a parsed manifest mapping (not a path) so it can run in
the install pipeline before the manifest hits disk. Manifests that do not
declare ``extensions.constitution`` are not Constitution-checked agents and
the scanner returns an empty result for them.

Severity model:
    info   — recommended-but-not-required
    warn   — should-fix; non-blocking
    error  — Constitution violation; install/merge blocked
"""

from __future__ import annotations

from dataclasses import asdict, dataclass, field
from typing import Any, Callable, Dict, List, Mapping, Sequence

__all__ = [
    "Finding",
    "ScanResult",
    "scan_manifest",
    "SEVERITIES",
    "SEVERITY_RANK",
    "CONSTITUTION_VERSION",
]

CONSTITUTION_VERSION = "1.0"

SEVERITIES: tuple[str, ...] = ("info", "warn", "error")
SEVERITY_RANK: Dict[str, int] = {"info": 0, "warn": 1, "error": 2}

# Categories that imply finance / tax disclaimer obligations
FINANCE_CATEGORIES = frozenset({"x-money-tool"})


@dataclass
class Finding:
    """A single Constitution scan finding."""

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

    def to_json(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class ScanResult:
    """Aggregated scan result for a manifest."""

    findings: List[Finding] = field(default_factory=list)

    @property
    def max_severity(self) -> str:
        if not self.findings:
            return "info"
        return max(self.findings, key=lambda f: SEVERITY_RANK[f.severity]).severity

    @property
    def has_errors(self) -> bool:
        return any(f.severity == "error" for f in self.findings)

    def filter_by_floor(self, floor: str) -> List[Finding]:
        threshold = SEVERITY_RANK[floor]
        return [f for f in self.findings if SEVERITY_RANK[f.severity] >= threshold]


CheckFn = Callable[[Mapping[str, Any]], List[Finding]]
CHECKS: Dict[str, CheckFn] = {}
ARTICLE_BY_CHECK: Dict[str, str] = {}


def register(name: str, article: str) -> Callable[[CheckFn], CheckFn]:
    """Register a check function under its Constitution article ID."""

    def deco(fn: CheckFn) -> CheckFn:
        CHECKS[name] = fn
        ARTICLE_BY_CHECK[name] = article
        return fn

    return deco


# ---------------------------------------------------------------------------
# Manifest accessors (v2.14 + extensions layout)
# ---------------------------------------------------------------------------


def _ext(manifest: Mapping[str, Any]) -> Mapping[str, Any]:
    """Return manifest.extensions or an empty mapping."""
    ext = manifest.get("extensions")
    return ext if isinstance(ext, Mapping) else {}


def _constitution(manifest: Mapping[str, Any]) -> Mapping[str, Any] | Sequence[Any] | None:
    """Return manifest.extensions.constitution (object or list) or None."""
    raw = _ext(manifest).get("constitution")
    if isinstance(raw, (Mapping, list)):
        return raw
    return None


def _constitution_articles(manifest: Mapping[str, Any]) -> List[str]:
    """Return the list of Constitution article references this manifest opts into.

    extensions.constitution may be a list of article refs (e.g. ["A1", "I.1"])
    or an object with a `rules`/`articles` sub-key. xlOS treats:
      * list -> the articles listed
      * object with `articles` -> that articles list
      * object without `articles` -> all checks apply (rules-style payload)
      * absent -> the agent opts out of Constitution scanning entirely
    """
    cons = _constitution(manifest)
    if cons is None:
        return []
    if isinstance(cons, list):
        return [str(item) for item in cons if isinstance(item, (str, int))]
    if isinstance(cons, Mapping):
        if isinstance(cons.get("articles"), list):
            return [str(a) for a in cons["articles"] if isinstance(a, (str, int))]
    # Rules-style object: all checks apply
    return ["*"]


def _applies_to(declared: List[str], article: str) -> bool:
    """Decide whether a given article-tagged check applies to this manifest."""
    if not declared:
        return False
    if "*" in declared:
        return True
    # Normalize to dotted form: "I" matches "I.1", "I.2"; "I.1" matches itself.
    for d in declared:
        if d == article:
            return True
        if "." not in d and article.startswith(d + "."):
            return True
        if article == d.split(".", 1)[0]:
            return True
    return False


# ---------------------------------------------------------------------------
# Checks
# ---------------------------------------------------------------------------


@register("I.3-no-admin-required", "I.3")
def check_no_admin(m: Mapping[str, Any]) -> List[Finding]:
    """Article I.3 — agents must not require admin privileges."""
    xspec = _ext(m).get("x_money_specific")
    if isinstance(xspec, Mapping) and xspec.get("requires_admin") is True:
        return [Finding(
            "error", "I3-001",
            "agents must not require admin privileges",
            "extensions.x_money_specific.requires_admin", "I.3",
        )]
    return []


@register("II.consent-gates-listed", "II")
def check_consent_gates_listed(m: Mapping[str, Any]) -> List[Finding]:
    """Article II — agents performing real-world actions must declare consent_gates."""
    cons = _constitution(m)
    if not isinstance(cons, Mapping):
        return []
    gates = cons.get("consent_gates")
    refusals = cons.get("hard_refusals") or []
    rules = cons.get("rules") or []
    text = " ".join(str(r) for r in rules) + " " + " ".join(str(r) for r in refusals)
    # Detect language implying real-world action
    real_world_signals = ("publish", "post", "DM", "auto-publish", "auto-schedule", "send", "export")
    if any(sig.lower() in text.lower() for sig in real_world_signals):
        if not isinstance(gates, list) or not gates:
            return [Finding(
                "warn", "II-001",
                "rules reference real-world actions but consent_gates is empty",
                "extensions.constitution.consent_gates", "II",
            )]
    return []


@register("III.hard-refusals-non-empty", "III")
def check_hard_refusals(m: Mapping[str, Any]) -> List[Finding]:
    """Article III — Constitution-tracked agents should list hard_refusals."""
    cons = _constitution(m)
    if not isinstance(cons, Mapping):
        return []
    rules = cons.get("rules") or []
    refusals = cons.get("hard_refusals")
    if rules and (not isinstance(refusals, list) or not refusals):
        return [Finding(
            "warn", "III-001",
            "constitution.rules is declared but hard_refusals is empty",
            "extensions.constitution.hard_refusals", "III",
        )]
    return []


@register("V.1-finance-disclaimer", "V.1")
def check_finance_disclaimer(m: Mapping[str, Any]) -> List[Finding]:
    """Article V.1 — x-money-tool agents must declare not_financial_advice."""
    category = m.get("category")
    if category not in FINANCE_CATEGORIES:
        return []
    xspec = _ext(m).get("x_money_specific")
    disclaimers = (xspec or {}).get("disclaimers") if isinstance(xspec, Mapping) else None
    if not isinstance(disclaimers, Mapping) or disclaimers.get("not_financial_advice") is not True:
        return [Finding(
            "error", "V1-001",
            "x-money-tool agents must set extensions.x_money_specific.disclaimers.not_financial_advice=true",
            "extensions.x_money_specific.disclaimers.not_financial_advice", "V.1",
        )]
    return []


@register("V.2-tax-disclaimer", "V.2")
def check_tax_disclaimer(m: Mapping[str, Any]) -> List[Finding]:
    """Article V.2 — agents that export tax data must declare not_tax_advice."""
    cons = _constitution(m)
    text = ""
    if isinstance(cons, Mapping):
        text = " ".join(str(r) for r in (cons.get("rules") or []))
    if "tax" not in text.lower():
        return []
    xspec = _ext(m).get("x_money_specific")
    disclaimers = (xspec or {}).get("disclaimers") if isinstance(xspec, Mapping) else None
    if not isinstance(disclaimers, Mapping) or disclaimers.get("not_tax_advice") is not True:
        return [Finding(
            "error", "V2-001",
            "agents referencing tax export must set not_tax_advice=true",
            "extensions.x_money_specific.disclaimers.not_tax_advice", "V.2",
        )]
    return []


@register("VI.1-cost-limits-declared", "VI.1")
def check_cost_limits(m: Mapping[str, Any]) -> List[Finding]:
    """Article VI.1 — agents with consent gates must declare cost_limits."""
    cons = _constitution(m)
    if not isinstance(cons, Mapping):
        return []
    gates = cons.get("consent_gates")
    if not isinstance(gates, list) or not gates:
        return []
    if not isinstance(m.get("cost_limits"), Mapping):
        return [Finding(
            "warn", "VI1-001",
            "consent_gates declared but top-level cost_limits is missing",
            "cost_limits", "VI.1",
        )]
    return []


@register("IV.super-agent-provenance", "IV")
def check_super_agent_provenance(m: Mapping[str, Any]) -> List[Finding]:
    """Article IV — super-agents must enable provenance with cite_sources."""
    if m.get("category") != "super-agent":
        return []
    prov = _ext(m).get("provenance")
    if not isinstance(prov, Mapping):
        return [Finding(
            "error", "IV-001",
            "super-agent missing extensions.provenance block",
            "extensions.provenance", "IV",
        )]
    findings: List[Finding] = []
    if prov.get("enabled") is False:
        findings.append(Finding(
            "error", "IV-002",
            "super-agent must have provenance.enabled=true",
            "extensions.provenance.enabled", "IV",
        ))
    if prov.get("cite_sources") is False:
        findings.append(Finding(
            "warn", "IV-003",
            "super-agent should set provenance.cite_sources=true",
            "extensions.provenance.cite_sources", "IV",
        ))
    if prov.get("append_only") is False:
        findings.append(Finding(
            "error", "IV-004",
            "super-agent provenance must be append_only=true",
            "extensions.provenance.append_only", "IV",
        ))
    return findings


@register("VII.deploy-targets-valid", "VII")
def check_deploy_targets(m: Mapping[str, Any]) -> List[Finding]:
    """Article VII — deploy.targets must use the canonical 4-target enum."""
    targets = (m.get("deploy") or {}).get("targets") or []
    valid = {"action", "ide", "worker", "web"}
    bad = [t for t in targets if t not in valid]
    if bad:
        return [Finding(
            "error", "VII-001",
            f"deploy.targets contains invalid values: {bad}",
            "deploy.targets", "VII",
        )]
    return []


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------


def scan_manifest(manifest: Mapping[str, Any]) -> ScanResult:
    """Scan a parsed v2.14 manifest for Constitution violations.

    Returns an empty ScanResult for manifests that do not declare
    ``extensions.constitution`` — those agents are not Constitution-tracked.
    """
    result = ScanResult()
    declared = _constitution_articles(manifest)
    if not declared:
        return result

    for name, fn in CHECKS.items():
        article = ARTICLE_BY_CHECK.get(name, "")
        if not _applies_to(declared, article):
            continue
        try:
            findings = fn(manifest)
        except Exception as exc:  # noqa: BLE001 - scanner must not crash callers
            findings = [Finding(
                "warn", "INT-001",
                f"check '{name}' raised: {exc}",
                name, article,
            )]
        result.findings.extend(findings)
    return result
