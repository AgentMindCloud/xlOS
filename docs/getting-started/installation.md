---
title: Install the xlOS CLI
description: Install xlOS, verify the toolchain, and set your env vars. Works identically on Mac, Linux, Windows.
---

# Install the xlOS CLI

## Requirements

| Requirement | Version                                |
| ----------- | -------------------------------------- |
| Python      | 3.11+                                  |
| pip         | 24.0+ (`python -m pip install -U pip`) |
| xAI API key | Free tier works for local dev          |

## Install

=== "pip (recommended)"
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

## Verify

```bash
xlos --version
```

`xlos doctor` runs a deeper diagnostic that checks Python version,
import paths, the schema-vendored copy of `grok-install.yaml`, and the
Constitution scanner:

```bash
xlos doctor
```

## Set your API key

Get a key from <https://x.ai>. Then:

=== "bash / zsh"
    ```bash
    export XAI_API_KEY=sk-...
    # Persist it
    echo 'export XAI_API_KEY=sk-...' >> ~/.zshrc
    ```

=== "fish"
    ```fish
    set -Ux XAI_API_KEY sk-...
    ```

=== "Windows (PowerShell)"
    ```powershell
    [Environment]::SetEnvironmentVariable("XAI_API_KEY", "sk-...", "User")
    ```

!!! warning "Never commit keys"
    xlOS reads keys from the environment — there's no on-disk config
    file. If you put a key in a YAML manifest, the Constitution scanner
    will fail the install.

## Next

[Build your first agent](first-agent.md).
