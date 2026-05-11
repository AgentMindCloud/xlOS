"""Tests for the Constitution safety scanner."""

from __future__ import annotations

from typing import Any

from xlos.safety import scanner
from xlos.safety.scanner import (
    CONSTITUTION_VERSION,
    Finding,
    ScanResult,
    SEVERITIES,
    SEVERITY_RANK,
    scan_manifest,
)


def _base(name: str = "agent") -> dict[str, Any]:
    return {
        "version": "2.14",
        "name": name,
        "description": "A test manifest for the safety scanner tests.",
        "runtime": {"engine": "grok", "model": "grok-4"},
        "deploy": {"targets": ["worker"]},
    }


def test_module_exports_public_api() -> None:
    assert CONSTITUTION_VERSION == "1.0"
    assert SEVERITIES == ("info", "warn", "error")
    assert SEVERITY_RANK["error"] > SEVERITY_RANK["warn"] > SEVERITY_RANK["info"]


def test_agent_without_constitution_returns_empty_result() -> None:
    result = scan_manifest(_base())
    assert isinstance(result, ScanResult)
    assert result.findings == []
    assert not result.has_errors


def test_finding_post_init_rejects_bad_severity() -> None:
    try:
        Finding(severity="critical", code="X", message="x")
    except ValueError:
        return
    raise AssertionError("Finding accepted invalid severity")


def test_check_registry_is_populated() -> None:
    # At least one check per major article should be registered.
    expected_articles = {"I.3", "II", "III", "V.1", "V.2", "VI.1", "IV", "VII"}
    assert expected_articles.issubset(set(scanner.ARTICLE_BY_CHECK.values()))


def test_finance_missing_disclaimer_produces_error() -> None:
    m = _base("finance-agent")
    m["category"] = "x-money-tool"
    m["extensions"] = {"constitution": ["V.1"], "x_money_specific": {"disclaimers": {}}}
    result = scan_manifest(m)
    errors = [f for f in result.findings if f.severity == "error"]
    assert errors, "expected an error finding for missing financial disclaimer"
    assert any(f.code.startswith("V1") for f in errors)


def test_super_agent_missing_provenance_produces_error() -> None:
    m = _base("super-agent")
    m["category"] = "super-agent"
    m["extensions"] = {"constitution": ["IV"]}
    result = scan_manifest(m)
    error_codes = [f.code for f in result.findings if f.severity == "error"]
    assert any(code.startswith("IV") for code in error_codes)


def test_invalid_deploy_target_produces_error() -> None:
    m = _base()
    m["deploy"]["targets"] = ["invalid"]
    m["extensions"] = {"constitution": ["VII"]}
    result = scan_manifest(m)
    error_codes = [f.code for f in result.findings if f.severity == "error"]
    assert any(code.startswith("VII") for code in error_codes)


def test_constitution_articles_filter_runs_only_matching_checks() -> None:
    m = _base("super-agent")
    m["category"] = "super-agent"
    # Opt in only to Article I.3 — IV (super-agent provenance) should be skipped.
    m["extensions"] = {"constitution": ["I.3"]}
    result = scan_manifest(m)
    iv_findings = [f for f in result.findings if f.article == "IV"]
    assert not iv_findings, "Article IV checks ran without being declared"


def test_constitution_articles_wildcard_runs_all_checks() -> None:
    # Rules-style object (no `articles` key) opts into all checks.
    m = _base("super-agent")
    m["category"] = "super-agent"
    m["extensions"] = {"constitution": {"rules": ["No publishing without consent."]}}
    result = scan_manifest(m)
    # Super-agent w/o provenance must produce at least one IV finding.
    assert any(f.article == "IV" for f in result.findings)


def test_high_severity_finding_filter() -> None:
    m = _base("finance-agent")
    m["category"] = "x-money-tool"
    m["extensions"] = {"constitution": ["V.1"]}
    result = scan_manifest(m)
    high = result.filter_by_floor("error")
    assert high, "expected at least one error-severity finding"
    for f in high:
        assert f.severity == "error"
