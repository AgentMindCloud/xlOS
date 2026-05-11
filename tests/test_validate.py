"""Tests for the v2.14 manifest validator."""

from __future__ import annotations

from typing import Any

import jsonschema
import pytest

from xlos.validators import validate_manifest_v214


def _good_manifest() -> dict[str, Any]:
    return {
        "version": "2.14",
        "name": "valid-agent",
        "description": "A perfectly valid v2.14 manifest used as the test baseline.",
        "runtime": {"engine": "grok", "model": "grok-4"},
        "deploy": {"targets": ["worker"]},
    }


def test_valid_minimal_manifest_passes() -> None:
    validate_manifest_v214(_good_manifest())


def test_missing_required_field_raises() -> None:
    manifest = _good_manifest()
    del manifest["runtime"]
    with pytest.raises(jsonschema.ValidationError) as info:
        validate_manifest_v214(manifest)
    assert "runtime" in info.value.message


def test_invalid_deploy_target_raises() -> None:
    manifest = _good_manifest()
    manifest["deploy"]["targets"] = ["cli"]  # not in v2.14 enum
    with pytest.raises(jsonschema.ValidationError) as info:
        validate_manifest_v214(manifest)
    assert "cli" in info.value.message or "targets" in info.value.message


def test_unknown_top_level_key_is_permitted_by_v214_schema() -> None:
    """v2.14 schema is permissive at root (additionalProperties: true).

    The migration deliberately leans on this: category and cost_limits live
    at top level even though they are not in `properties`.
    """
    manifest = _good_manifest()
    manifest["category"] = "creator-template"
    manifest["cost_limits"] = {"usd_per_session_max": 0.5}
    manifest["totally_unknown_field"] = {"shape": "free"}
    validate_manifest_v214(manifest)
