"""Tests for the v2.14 manifest validator."""

from __future__ import annotations

from typing import Any

import jsonschema
import pytest

from xlos.validators import load_schema, validate_manifest_v214


def _minimal() -> dict[str, Any]:
    return {
        "version": "2.14",
        "name": "valid-agent",
        "description": "A minimal but valid v2.14 manifest used in tests.",
        "runtime": {"engine": "grok", "model": "grok-4"},
        "deploy": {"targets": ["ide"]},
    }


def test_load_schema_returns_dict() -> None:
    schema = load_schema()
    assert isinstance(schema, dict)
    assert schema.get("title") == "grok-install agent manifest v2.14"


def test_valid_minimal_manifest_passes() -> None:
    validate_manifest_v214(_minimal())


def test_missing_required_field_raises() -> None:
    m = _minimal()
    del m["runtime"]
    with pytest.raises(jsonschema.ValidationError) as excinfo:
        validate_manifest_v214(m)
    # The required-field error names the missing field.
    assert "runtime" in excinfo.value.message


def test_invalid_deploy_target_value_raises() -> None:
    m = _minimal()
    m["deploy"]["targets"] = ["not-a-real-target"]
    with pytest.raises(jsonschema.ValidationError) as excinfo:
        validate_manifest_v214(m)
    # Offending path is deploy.targets[0]
    path = list(excinfo.value.absolute_path)
    assert path[0] == "deploy"
    assert path[1] == "targets"


def test_unknown_top_level_key_is_permitted() -> None:
    """Schema is additionalProperties: true at the root -- unknown top-level
    keys must be accepted (DECISIONS.md D5 forward-compat)."""
    m = _minimal()
    m["x_brand_new_field"] = {"foo": "bar"}
    validate_manifest_v214(m)


def test_extensions_constitution_accepts_array_form() -> None:
    m = _minimal()
    m["extensions"] = {"constitution": ["I", "II"]}
    validate_manifest_v214(m)


def test_extensions_constitution_accepts_object_form() -> None:
    m = _minimal()
    m["extensions"] = {"constitution": {"articles": ["I", "II"], "rules": ["..."]}}
    validate_manifest_v214(m)


def test_runtime_with_extra_field_rejected() -> None:
    """runtime block has additionalProperties: false."""
    m = _minimal()
    m["runtime"]["unknown_field"] = "value"
    with pytest.raises(jsonschema.ValidationError):
        validate_manifest_v214(m)
