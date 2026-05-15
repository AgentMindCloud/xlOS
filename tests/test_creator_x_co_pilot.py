"""Guards the Creator X Co-Pilot flagship (Light tier).

Fails loudly if the flagship regresses to an empty manifest or if the Light
prompt starts implying state/automation it does not have.
"""

from __future__ import annotations

from pathlib import Path

import yaml

from xlos.safety import scan_manifest
from xlos.validators import validate_manifest_v214

AGENT = Path(__file__).resolve().parent.parent / "agents" / "flagship" / "creator-x-co-pilot"


def test_flagship_manifest_validates_and_passes_constitution() -> None:
    data = yaml.safe_load((AGENT / "grok-install.yaml").read_text(encoding="utf-8"))
    validate_manifest_v214(data)
    assert not scan_manifest(data).has_errors
    assert data["extensions"]["tier"] == "light"
    assert data["extensions"].get("flagship") is True


def test_flagship_light_prompt_is_present_and_honest() -> None:
    prompt = (AGENT / "light" / "prompt.md").read_text(encoding="utf-8").lower()
    assert "drafts only" in prompt
    assert "no persistent memory" in prompt
    # Must not claim auto-posting.
    assert "never auto-post" in prompt
