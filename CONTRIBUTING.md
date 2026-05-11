# Contributing to xlOS

Thanks for your interest in contributing. xlOS is a cross-platform developer
runtime for Grok agents on X. We welcome bug reports, fixes, and well-scoped
new features.

## Filing issues

Open an issue on GitHub before starting non-trivial work. Useful issues
include:

- A clear description of the problem or request.
- Steps to reproduce, expected behaviour, and actual behaviour for bugs.
- The OS (Linux, macOS, or Windows) and Python version you saw it on.
- Logs, stack traces, or minimal reproductions where possible.

## Development environment

xlOS targets Python 3.11+ and runs on Linux, macOS, and Windows. To set up a
working copy:

```
git clone https://github.com/AgentMindCloud/xlOS.git
cd xlOS
python -m venv .venv
source .venv/bin/activate    # Windows: .venv\Scripts\activate
pip install -e '.[dev]'
```

## Running tests

The full test matrix runs on Linux, macOS, and Windows in CI. Locally:

```
pytest                # run the test suite
pytest --cov=xlos     # run with coverage
ruff check .          # lint
black --check .       # formatting check
mypy src/             # type-check
```

All four checks must pass before opening a pull request.

## Submitting a pull request

1. Fork the repository and create a feature branch from `main`.
2. Make focused commits with clear messages.
3. Add or update tests for any behaviour change.
4. Run the full local check suite (`pytest`, `ruff`, `black`, `mypy`).
5. Open a pull request against `main` describing what changed and why.
6. CI runs lint, the cross-platform test matrix, and manifest validation.
   All checks must be green before review.

## Code style

- Python 3.11+ syntax. Type-annotate all public functions; mypy runs in strict
  mode against `src/`.
- 100-character line length. `ruff` and `black` are the source of truth.
- Use `pathlib.Path` for filesystem work. Never hardcode `~`, `/home/`,
  `/Users/`, `%APPDATA%`, or path separators.
- Use `platformdirs` for any per-user state and `filelock` for any shared
  mutable state.
- No PowerShell, batch files, or shell scripts in the repo. Python only.
