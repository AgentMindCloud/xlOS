# Changelog

## [Unreleased] — active development toward v1.0

xlOS is in active development toward v1.0. The runtime, validator, safety
scanner, marketplace, and browser extension are working today. The agent
library is being rebuilt for quality: agents ship as `grok-install.yaml`
specifications and are recovered to full, runnable implementations
progressively (Living Narrative Fabric first). An agent is only labelled
**available** once its manifest validates, it runs end-to-end, its tests
pass, and its docs match reality. See the v1.0 Roadmap in `README.md`.

### Changed

- Documentation corrected to describe the current state accurately: the agent
  library is specifications-first and being rebuilt; the quickstart now uses
  commands that work today; "1.0.0 stable release" language removed in favour
  of an honest "active development toward v1.0" status and roadmap.

## Platform foundation (pre-v1.0)

The runtime foundation that the v1.0 agent rebuild stands on.

### Added

- `[project.urls]` (Homepage, Repository, Documentation, Issues, Changelog).
- PEP 561 `py.typed` marker so downstream type checkers see xlOS as typed.

### Changed

- `safety/constitution.md` made platform-neutral: `$env:LOCALAPPDATA\…`
  paths replaced with `platformdirs`-based language matching the runtime's
  actual behaviour; the "Windows 11 + PowerShell only" rule rewritten as a
  platform-neutral runtime guarantee; encryption claim relaxed into a
  platform-specific policy (DPAPI / Keychain / Secret Service); stale
  `spec/v2.15/` references corrected to `spec/v2.14/` + its `extensions:`
  block.
- README, banner assets, and brand subset standardized on **xlOS**.

### Security

- Constitution scanner: Articles I (Universal Rules), III (Hard Refusals),
  and VII (Local-First & Privacy-First) are enforced unconditionally on
  every manifest scan. This closes a bypass where omitting an article from
  `extensions.constitution` would silently skip its checks.
