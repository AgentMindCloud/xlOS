"""Tests for the xlOS Constitution scanner."""

from __future__ import annotations

from typing import Any

import pytest

from xlos.safety import Finding, ScanResult, registered_articles, scan_manifest


def _base(category: str | None = None) -> dict[str, Any]:
    m: dict[str, Any] = {
        "version": "2.14",
        "name": "scanner-test",
        "description": "A baseline manifest for the Constitution scanner tests.",
        "runtime": {"engine": "grok", "model": "grok-4"},
        "deploy": {"targets": ["worker"]},
    }
    if category is not None:
        m["category"] = category
    return m


def test_no_extensions_constitution_returns_empty_result() -> None:
    result = scan_manifest(_base())
    assert isinstance(result, ScanResult)
    assert result.findings == []
    assert result.articles_checked == []
    assert not result.has_high_severity


def test_declared_articles_recorded_even_when_no_checks_fire() -> None:
    manifest = _base("creator-template")
    manifest["extensions"] = {"constitution": ["II", "VIII"]}
    result = scan_manifest(manifest)
    assert set(result.articles_checked) == {"II", "VIII"}


def test_article_i_forbidden_positioning_flagged() -> None:
    manifest = _base("creator-template")
    manifest["description"] = "An alternative to grok with better features."
    manifest["extensions"] = {"constitution": ["I"]}
    result = scan_manifest(manifest)
    assert result.has_high_severity
    assert any(f.code == "POS-001" for f in result.findings)


def test_article_iii_blacklisted_consent_gate_is_error() -> None:
    manifest = _base("super-agent")
    manifest["extensions"] = {
        "constitution": ["III"],
        "multi_agent_roles": {
            "consent_gates": ["scrape_authenticated_x_content", "publish_to_x"],
        },
    }
    result = scan_manifest(manifest)
    assert result.has_high_severity
    codes = [f.code for f in result.findings]
    assert "HR-001" in codes


def test_article_iv_super_agent_requires_provenance() -> None:
    manifest = _base("super-agent")
    manifest["extensions"] = {
        "constitution": ["IV"],
    }
    result = scan_manifest(manifest)
    assert result.has_high_severity
    assert any(f.code == "PRV-001" for f in result.findings)


def test_article_v_finance_disclaimer_required() -> None:
    manifest = _base("x-money-tool")
    manifest["extensions"] = {"constitution": ["V.1"]}
    result = scan_manifest(manifest)
    assert result.has_high_severity
    assert any(f.code == "DSC-001" for f in result.findings)


def test_article_vii_tracker_in_manifest_is_error() -> None:
    manifest = _base("creator-template")
    manifest["extensions"] = {"constitution": ["VII"]}
    manifest["analytics_url"] = "https://google-analytics.com/collect"
    result = scan_manifest(manifest)
    assert result.has_high_severity
    assert any(f.code == "PII-005" for f in result.findings)


def test_only_declared_articles_are_run() -> None:
    """A manifest that declares ["I"] only runs Article I checks.

    The manifest below would trip Article III if that article were also
    declared (it lists a blacklisted gate), but because only ["I"] is in
    extensions.constitution, the III check never fires.
    """
    manifest = _base("super-agent")
    manifest["extensions"] = {
        "constitution": ["I"],
        "multi_agent_roles": {
            "consent_gates": ["bypass_safety_scanner"],
        },
    }
    result = scan_manifest(manifest)
    codes = [f.code for f in result.findings]
    # Article III error must NOT be present because Article III was not declared.
    assert "HR-001" not in codes


def test_unknown_article_is_silently_tolerated() -> None:
    manifest = _base("creator-template")
    manifest["extensions"] = {"constitution": ["XII"]}  # we only register I..IX
    result = scan_manifest(manifest)
    # No findings, but the article appears in the list of checked articles.
    assert "XII" in result.articles_checked
    assert result.findings == []


def test_finding_dataclass_rejects_bad_severity() -> None:
    with pytest.raises(ValueError):
        Finding(severity="critical", code="X", message="x")


def test_registered_articles_covers_constitution_v1_chapters() -> None:
    registered = set(registered_articles())
    for article in ("I", "II", "III", "IV", "V", "V.1", "V.2", "VI", "VII", "VIII", "IX"):
        assert article in registered, f"Article {article} not registered"
