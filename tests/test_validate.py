"""Tests for the v2.14 schema validator."""

from __future__ import annotations

from typing import Any

import jsonschema
import pytest

from xlos.validators import load_schema_v214, validate_manifest_v214


def _valid_manifest() -> dict[str, Any]:
    return {
        "version": "2.14",
        "name": "agent",
        "description": "A valid minimal v2.14 manifest used for schema tests.",
        "runtime": {"engine": "grok", "model": "grok-4"},
        "deploy": {"targets": ["worker"]},
    }


def test_load_schema_returns_v214_dict() -> None:
    schema = load_schema_v214()
    assert isinstance(schema, dict)
    assert schema["properties"]["version"]["const"] == "2.14"


def test_valid_minimal_manifest_passes() -> None:
    validate_manifest_v214(_valid_manifest())


def test_missing_required_field_raises_with_path() -> None:
    manifest = _valid_manifest()
    del manifest["runtime"]
    with pytest.raises(jsonschema.ValidationError) as exc_info:
        validate_manifest_v214(manifest)
    assert "runtime" in exc_info.value.message


def test_invalid_deploy_target_value_fails() -> None:
    manifest = _valid_manifest()
    manifest["deploy"]["targets"] = ["mainframe"]
    with pytest.raises(jsonschema.ValidationError) as exc_info:
        validate_manifest_v214(manifest)
    assert list(exc_info.value.absolute_path)[:2] == ["deploy", "targets"]


def test_unknown_top_level_field_passes_because_schema_is_permissive() -> None:
    # spec/v2.14/schema.json sets additionalProperties: true at the root,
    # so unknown top-level keys are accepted.
    manifest = _valid_manifest()
    manifest["category"] = "creator-template"
    manifest["cost_limits"] = {"usd_per_session_max": 0.5}
    validate_manifest_v214(manifest)
