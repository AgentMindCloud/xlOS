"""Tests for ``xlos.validators.validate_manifest_v214``."""

from __future__ import annotations

from typing import Any

import jsonschema
import pytest

from xlos.validators import load_schema, validate_manifest_v214


def _valid() -> dict[str, Any]:
    return {
        "version": "2.14",
        "name": "test-agent",
        "description": "A short test agent description used by the validator tests.",
        "runtime": {"engine": "grok", "model": "grok-4"},
        "deploy": {"targets": ["ide"]},
    }


def test_valid_minimal_manifest_passes() -> None:
    validate_manifest_v214(_valid())


def test_missing_required_field_fails_with_path() -> None:
    bad = _valid()
    del bad["description"]
    with pytest.raises(jsonschema.ValidationError) as exc:
        validate_manifest_v214(bad)
    # The validation error should mention the missing field by name.
    assert "description" in exc.value.message


def test_invalid_deploy_targets_value_fails() -> None:
    bad = _valid()
    bad["deploy"]["targets"] = ["not-a-target"]
    with pytest.raises(jsonschema.ValidationError) as exc:
        validate_manifest_v214(bad)
    assert "deploy" in list(exc.value.absolute_path) or "targets" in str(exc.value)


def test_unknown_top_level_field_is_accepted_when_schema_permissive() -> None:
    schema = load_schema()
    # The vendored schema is permissive at the root (additionalProperties: true).
    assert schema.get("additionalProperties") is True
    permissive = _valid()
    permissive["category"] = "creator-template"
    permissive["cost_limits"] = {"usd_per_session_max": 0.5}
    permissive["random_future_field"] = {"any": "shape"}
    # Should not raise.
    validate_manifest_v214(permissive)


def test_extensions_constitution_accepts_array() -> None:
    m = _valid()
    m["extensions"] = {"constitution": ["I", "II", "VII"]}
    validate_manifest_v214(m)


def test_runtime_engine_must_be_grok() -> None:
    bad = _valid()
    bad["runtime"]["engine"] = "openai"
    with pytest.raises(jsonschema.ValidationError):
        validate_manifest_v214(bad)
