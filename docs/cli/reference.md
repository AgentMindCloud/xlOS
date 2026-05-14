---
title: CLI reference
description: Every xlos command — install, run, list, doctor.
---

# CLI reference

The `xlos` CLI parses YAML, runs the Constitution scanner, installs
agents into a local registry, runs them, and reports on the state of
the local environment.

## Install

=== "pip"
    ```bash
    pip install xlos
    ```

=== "pipx (isolated)"
    ```bash
    pipx install xlos
    ```

=== "from source"
    ```bash
    git clone https://github.com/AgentMindCloud/xlOS
    cd xlOS
    pip install -e .
    ```

Check it's installed:

```bash
xlos --version
```

## Global flags

| Flag             | Description                                         |
| ---------------- | --------------------------------------------------- |
| `--help`         | Show help for any command.                          |
| `--version`      | Print CLI version.                                  |

## Commands

### `xlos install`

Validates a `grok-install.yaml` manifest against the vendored v2.14
schema, runs the Constitution safety scanner, and installs the agent
into the local registry.

```bash
xlos install [MANIFEST]
xlos install --from-stdin < my-manifest.yaml
```

| Argument / flag | Description                                                  |
| --------------- | ------------------------------------------------------------ |
| `MANIFEST`      | Path to a `grok-install.yaml` file.                          |
| `--from-stdin`  | Read the manifest from standard input.                       |

Example:

```bash
xlos install agents/super-agents/living-narrative-fabric/grok-install.yaml
```

The install fails (with a non-zero exit code) when:

- The manifest does not validate against `spec/v2.14/schema.json`.
- The Constitution scanner reports any `error`-level finding.

### `xlos run`

Runs an installed agent by name. The runtime resolves the agent in the
local registry, sets up its declared env vars, and dispatches to the
entrypoint declared in its manifest.

```bash
xlos run <name>
```

Example:

```bash
xlos run living-narrative-fabric
```

### `xlos list`

Lists every agent currently installed in the local registry.

```bash
xlos list
xlos list --json
```

`--json` emits a machine-readable manifest with per-agent metadata
(category, Constitution articles, runtime, install path).

### `xlos doctor`

Runs a diagnostic against the local environment:

```bash
xlos doctor
```

Reports:

- Python version (`sys.version`).
- Platform (`sys.platform`).
- Per-user install directory (resolved via `platformdirs`) and whether
  it is writable.

Use this first when something is off — it confirms the environment
xlOS will install agents into.

## Python API

The CLI is a thin wrapper around the `xlos` Python package. Useful if
you want to embed install / run / doctor in another tool.

```python
from xlos.install import install_command
from xlos.runtime import run_command, list_command, doctor_command

install_command("path/to/grok-install.yaml", from_stdin=False)
run_command("my-agent")
list_command(json_output=True)
doctor_command()
```

The Constitution scanner is `xlos.safety.scan_manifest(manifest_dict)`
(also re-exported as `xlos.safety.scanner.scan_manifest`).

## Cross-platform notes

| OS      | Status            | Notes                                              |
| ------- | ----------------- | -------------------------------------------------- |
| macOS   | tested in CI      | Python 3.11+ via pip / pipx.                       |
| Linux   | tested in CI      | Python 3.11+ via pip / pipx; same as macOS.        |
| Windows | tested in CI      | Python 3.11+ via pip / pipx. PowerShell + cmd both work. |
| iOS     | browser only      | Use the marketplace and browser extension on the web. |
| Android | browser only      | Same.                                              |

## Troubleshooting

| Symptom                                          | Fix                                                               |
| ------------------------------------------------ | ----------------------------------------------------------------- |
| `Manifest failed schema validation`              | Run `xlos doctor` to verify the vendored schema sha256.           |
| `Constitution scanner: error-level finding`      | Read the finding text; the scanner names the article and the field that violates it. |
| `XAI_API_KEY is not set`                         | `export XAI_API_KEY=sk-...` or add it to `.env`; don't commit.    |
| `Agent not found` from `xlos run`                | Run `xlos list` to see what's installed.                          |
