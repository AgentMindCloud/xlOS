# Changelog

## [Unreleased]

## [1.0.0] - 2026-05-15

Initial stable release.

### Added

- `[project.urls]` (Homepage, Repository, Documentation, Issues, Changelog)
  and Production/Stable trove classifiers in `pyproject.toml`.
- PEP 561 `py.typed` marker so downstream type checkers see xlOS as a typed
  package.

### Changed

- Version bumped from `1.0.0-alpha.1` to `1.0.0`.
- `safety/constitution.md` made platform-neutral:
  `$env:LOCALAPPDATA\grok-agent\…` paths replaced with `platformdirs`-based
  language matching the runtime's actual behaviour
  (`platformdirs.user_data_dir("xlos")`); the "Windows 11 + PowerShell only"
  rule rewritten as a platform-neutral runtime guarantee; DPAPI-only
  encryption claim relaxed into a platform-specific policy
  (DPAPI / Keychain / Secret Service); stale `spec/v2.15/` references
  corrected to `spec/v2.14/` with its `extensions:` block.
- README, banner assets, and brand subset standardized on **xlOS** (PRs
  leading up to release).

### Security

- Constitution scanner: Articles I (Universal Rules), III (Hard Refusals),
  and VII (Local-First & Privacy-First) are now enforced unconditionally on
  every manifest scan. This closes a bypass where omitting an article from
  `extensions.constitution` would silently skip its checks. (PR #12)

---

Release entries below are auto-generated from GitHub releases starting v1.0.0.
