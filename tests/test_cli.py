"""Smoke tests for the xlOS CLI surface."""

from __future__ import annotations

from click.testing import CliRunner


def test_cli_module_imports() -> None:
    from xlos.cli import main

    assert main is not None


def test_version_exits_zero() -> None:
    from xlos.cli import main

    runner = CliRunner()
    result = runner.invoke(main, ["--version"])
    assert result.exit_code == 0


def test_help_lists_all_commands() -> None:
    from xlos.cli import main

    runner = CliRunner()
    result = runner.invoke(main, ["--help"])
    assert result.exit_code == 0
    for command in ("install", "run", "list", "doctor"):
        assert command in result.output, f"missing {command!r} in help output"
