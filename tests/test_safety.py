"""Tests for the Constitution safety scanner."""

from __future__ import annotations

from typing import Any

from xlos.safety import scan_manifest
from xlos.safety.scanner import CHECKS, Finding, ScanResult


def _base() -> dict[str, Any]:
    return {
        "version": "2.14",
        "name": "test-agent",
        "description": "Base manifest for scanner tests.",
        "runtime": {"engine": "grok", "model": "grok-4"},
        "deploy": {"targets": ["ide"]},
        "category": "creator-template",
    }


def test_agent_without_extensions_constitution_is_skipped() -> None:
    result = scan_manifest(_base())
    assert result.skipped is True
    assert result.findings == []


def test_empty_extensions_constitution_array_is_skipped() -> None:
    m = _base()
    m["extensions"] = {"constitution": []}
    result = scan_manifest(m)
    assert result.skipped is True


def test_agent_with_only_a_single_article_runs_only_that_article() -> None:
    m = _base()
    m["extensions"] = {"constitution": ["I"]}
    result = scan_manifest(m)
    assert result.skipped is False
    # The I.1-license check runs but the manifest has no license declared,
    # so the check returns []. The I.2-xai-positioning runs and is clean.
    # No other articles' checks should have fired.
    for f in result.findings:
        assert f.article.startswith("I"), f"unexpected article {f.article}"


def test_violating_a_check_produces_high_severity_finding() -> None:
    """Forbidden positioning phrase in description -> POS-001 error."""
    m = _base()
    m["description"] = "An alternative to grok with better features."
    m["extensions"] = {"constitution": ["I", "I.2"]}
    result = scan_manifest(m)
    assert any(f.code == "POS-001" for f in result.findings)
    assert result.has_high_severity is True


def test_super_agent_without_provenance_flags_iv_violation() -> None:
    m = _base()
    m["category"] = "super-agent"
    m["extensions"] = {"constitution": {"articles": ["IV"], "rules": ["..."]}}
    result = scan_manifest(m)
    assert any(f.code == "PRV-001" for f in result.findings)
    assert result.has_errors is True


def test_super_agent_with_provenance_is_clean_on_iv() -> None:
    m = _base()
    m["category"] = "super-agent"
    m["extensions"] = {
        "constitution": {"articles": ["IV"], "rules": ["Article IV — provenance."]},
        "provenance": {"enabled": True, "append_only": True},
    }
    result = scan_manifest(m)
    assert not any(
        f.code == "PRV-001" for f in result.findings
    ), "super-agent with provenance.enabled should not flag PRV-001"


def test_finance_agent_without_disclaimer_flags_v1() -> None:
    m = _base()
    m["category"] = "x-money-tool"
    m["extensions"] = {"constitution": {"articles": ["V", "V.1"], "rules": ["..."]}}
    result = scan_manifest(m)
    assert any(f.code == "DSC-001" for f in result.findings)


def test_finance_agent_with_disclaimer_is_clean_on_v1() -> None:
    m = _base()
    m["category"] = "x-money-tool"
    m["extensions"] = {
        "constitution": {"articles": ["V", "V.1"], "rules": ["..."]},
        "x_money_specific": {"disclaimers": {"not_financial_advice": True}},
    }
    result = scan_manifest(m)
    assert not any(f.code == "DSC-001" for f in result.findings)


def test_hard_refusal_in_consent_gates_is_flagged() -> None:
    m = _base()
    m["extensions"] = {
        "constitution": {
            "articles": ["III"],
            "rules": ["..."],
            "consent_gates": ["scrape_authenticated_x_content"],
        }
    }
    result = scan_manifest(m)
    assert any(f.code == "HR-008" for f in result.findings)


def test_constitution_array_form_works() -> None:
    """extensions.constitution can be a bare list of article refs (the schema's
    oneOf permits that shape too)."""
    m = _base()
    m["extensions"] = {"constitution": ["III"]}
    result = scan_manifest(m)
    assert result.skipped is False
    assert result.applicable_articles == ["III"]


def test_at_least_one_check_per_major_article_is_registered() -> None:
    """Sanity: every major article we ship has at least one check."""
    all_articles: set[str] = set()
    for articles, _fn in CHECKS.values():
        all_articles.update(articles)
    # The major articles I-VIII must each have at least one declared check.
    for major in ("I", "II", "III", "IV", "V", "VI", "VII", "VIII"):
        assert major in all_articles or any(
            a.startswith(major + ".") for a in all_articles
        ), f"no check covers Article {major}"


def test_finding_to_json_serializes() -> None:
    f = Finding("warn", "X-001", "test", "loc", "I")
    d = f.to_json()
    assert d["severity"] == "warn"
    assert d["code"] == "X-001"


def test_scan_result_max_severity_picks_highest() -> None:
    r = ScanResult(
        findings=[
            Finding("info", "A", "a"),
            Finding("warn", "B", "b"),
            Finding("error", "C", "c"),
        ]
    )
    assert r.max_severity == "error"
    assert r.has_errors is True
