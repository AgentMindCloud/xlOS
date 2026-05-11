"""xlOS command-line interface."""

from __future__ import annotations

import click
from rich.console import Console

from xlos import __version__
from xlos.install import install_command
from xlos.runtime import doctor_command, list_command, run_command

console = Console()


@click.group()
@click.version_option(__version__)
def main() -> None:
    """xlOS - cross-platform runtime for Grok agents on X."""


@main.command()
@click.argument("manifest", type=click.Path(exists=True), required=False)
@click.option("--from-stdin", is_flag=True)
def install(manifest: str | None, from_stdin: bool) -> None:
    """Install a grok-install.yaml manifest."""
    install_command(manifest, from_stdin)


@main.command()
@click.argument("name")
def run(name: str) -> None:
    """Run an installed agent."""
    run_command(name)


@main.command(name="list")
@click.option("--json", "json_output", is_flag=True, help="Emit JSON instead of a table.")
def list_agents(json_output: bool) -> None:
    """List installed agents."""
    list_command(json_output=json_output)


@main.command()
def doctor() -> None:
    """Diagnose environment issues."""
    doctor_command()


if __name__ == "__main__":
    main()
