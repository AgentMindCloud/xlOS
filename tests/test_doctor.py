"""Tests for the doctor command."""

from __future__ import annotations

from click.testing import CliRunner


def test_doctor_exits_zero_and_reports_environment() -> None:
    from xlos.cli import main

    runner = CliRunner()
    result = runner.invoke(main, ["doctor"])
    assert result.exit_code == 0, result.output
    assert "Python" in result.output
    assert "Platform" in result.output
    assert "Install directory" in result.output
