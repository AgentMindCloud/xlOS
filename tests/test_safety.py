"""Tests for ``xlos.safety.scanner``."""

from __future__ import annotations

from typing import Any

import pytest

from xlos.safety.scanner import (
    CHECKS,
    SEVERITIES,
    Finding,
    ScanResult,
    constitution_path,
    scan_manifest,
)


def _base_manifest() -> dict[str, Any]:
    return {
        "version": "2.14",
        "name": "scanner-test",
        "description": "Manifest used to drive the safety scanner tests.",
        "runtime": {"engine": "grok", "model": "grok-4"},
        "deploy": {"targets": ["ide"]},
        "category": "creator-template",
    }


def test_no_extensions_constitution_returns_empty_result() -> None:
    manifest = _base_manifest()
    result = scan_manifest(manifest)
    assert isinstance(result, ScanResult)
    assert result.findings == []
    assert not result.has_errors
    assert result.max_severity == "info"


def test_extensions_constitution_a1_runs_only_article_i_checks() -> None:
    manifest = _base_manifest()
    manifest["extensions"] = {"constitution": ["I"]}
    result = scan_manifest(manifest)
    # All article-I checks should accept this manifest (license defaults to
    # Apache-2.0, no Windows admin, version=2.14, no forbidden positioning).
    assert not result.has_errors
    # Findings (if any) all carry article I prefix.
    for f in result.findings:
        assert f.article.startswith("I")


def test_finance_disclaimer_check_fires_on_violation() -> None:
    manifest = _base_manifest()
    manifest["category"] = "x-money-tool"
    manifest["extensions"] = {
        "constitution": ["V.1"],
        "original_kind": "finance-dashboard",
        "safety_v215": {
            "disclaimers": {"not_financial_advice": False},
        },
    }
    result = scan_manifest(manifest)
    assert result.has_errors
    codes = {f.code for f in result.findings if f.severity == "error"}
    assert "DSC-001" in codes


def test_super_agent_without_provenance_fails() -> None:
    manifest = _base_manifest()
    manifest["category"] = "super-agent"
    manifest["extensions"] = {
        "constitution": ["IV"],
        "original_kind": "super-agent",
    }
    result = scan_manifest(manifest)
    assert result.has_errors
    codes = {f.code for f in result.findings if f.severity == "error"}
    assert "PRV-001" in codes


def test_super_agent_with_proper_provenance_passes() -> None:
    manifest = _base_manifest()
    manifest["category"] = "super-agent"
    manifest["extensions"] = {
        "constitution": ["III", "IV"],
        "original_kind": "super-agent",
        "provenance": {"enabled": True, "append_only": True, "cite_sources": True},
        "constitution_v215": {"rules": ["one rule"]},
    }
    result = scan_manifest(manifest)
    assert not result.has_errors


def test_each_article_has_at_least_one_check() -> None:
    """Constitution articles I, II, III, IV, V.1, V.2, V.3, VI, VII, VIII
    must each have at least one registered scanner check."""
    seen_articles = {article for _name, (_fn, article) in CHECKS.items()}
    for required in ("I", "II", "III", "IV", "V.1", "V.2", "V.3", "VI", "VII", "VIII"):
        assert required in seen_articles, f"no scanner check for article {required}"


def test_hard_refusal_blacklist_fires() -> None:
    manifest = _base_manifest()
    manifest["extensions"] = {
        "constitution": ["III"],
        "constitution_v215": {
            "consent_gates": ["scrape_authenticated_x_content"],
        },
    }
    result = scan_manifest(manifest)
    codes = {f.code for f in result.findings if f.severity == "error"}
    assert "HR-008" in codes


def test_windows_requires_admin_blocks() -> None:
    manifest = _base_manifest()
    manifest["extensions"] = {
        "constitution": ["I"],
        "windows_legacy": {"requires_admin": True},
    }
    result = scan_manifest(manifest)
    codes = {f.code for f in result.findings if f.severity == "error"}
    assert "WIN-001" in codes


def test_constitution_md_is_locatable() -> None:
    path = constitution_path()
    assert path.is_file()
    text = path.read_text(encoding="utf-8")
    assert "Agent Constitution" in text


def test_severities_constant_is_stable() -> None:
    assert SEVERITIES == ("info", "warn", "error")


def test_finding_to_line_format() -> None:
    f = Finding("error", "TEST-001", "boom", "loc", "I.1")
    line = f.to_line()
    assert "ERROR" in line
    assert "TEST-001" in line
    assert "I.1" in line


def test_real_world_action_disclaimer_warns() -> None:
    manifest = _base_manifest()
    manifest["extensions"] = {
        "constitution": ["V.3"],
        "constitution_v215": {"consent_gates": ["publish_to_x"]},
        "safety_v215": {"disclaimers": {"real_world_action_consent": False}},
    }
    result = scan_manifest(manifest)
    codes = {f.code for f in result.findings if f.severity == "warn"}
    assert "DSC-003" in codes


def test_pytest_severity_floor_filtering() -> None:
    manifest = _base_manifest()
    manifest["extensions"] = {
        "constitution": ["VI"],
        "constitution_v215": {"consent_gates": ["publish_to_x"]},
        "safety_v215": {"human_in_the_loop": {"enabled": False}},
    }
    result = scan_manifest(manifest)
    errors = result.filter_by_floor("error")
    warns = result.filter_by_floor("warn")
    assert len(errors) <= len(warns)


@pytest.mark.parametrize(
    "kind,gate,expect_code",
    [
        ("finance-dashboard", "scrape_authenticated_x_content", "HR-008"),
        ("super-agent", "impersonate_user_identity", "HR-008"),
    ],
)
def test_hard_refusal_blacklist_parametrized(kind: str, gate: str, expect_code: str) -> None:
    manifest = _base_manifest()
    manifest["extensions"] = {
        "constitution": ["III"],
        "original_kind": kind,
        "constitution_v215": {"consent_gates": [gate]},
    }
    result = scan_manifest(manifest)
    codes = {f.code for f in result.findings if f.severity == "error"}
    assert expect_code in codes
