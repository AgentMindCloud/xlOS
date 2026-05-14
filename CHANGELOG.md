# Changelog

All notable changes to xlOS are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2026-05-14

First stable release of xlOS — the cross-platform Python runtime for installing,
validating, and running Grok agents on macOS, Linux, and Windows.

### Highlights

- 33 production agents indexed and installable via the `xlos` CLI.
- Constitution safety scanner: 24 named checks across 8 articles, with Articles
  I, III, and VII enforced unconditionally on every manifest scan.
- PyPI-publishable wheel (Python 3.11 / 3.12) and tag-driven release automation.
- Next.js marketplace (88 prerendered pages) and Manifest v3 browser extension
  ship alongside the CLI.

### Security / Safety

- **Constitution scanner — unconditional core enforcement.** Articles I
  (Universal Rules), III (Hard Refusals), and VII (Local-First & Privacy-First)
  are now enforced unconditionally on every manifest scan. Previously, omitting
  an article from `extensions.constitution` would silently skip its checks.
  (PR #12)
- Constitution scanner shipped at `src/xlos/safety/scanner.py`, enforced via
  three layers: schema validation, pre-install scan, and runtime checks.
- Constitution charter authoritative copy at `src/xlos/safety/constitution.md`
  (8 articles, 24 named checks, 3 severity levels).

### Branding & UX

- Renamed marketplace surfaces from "GrokInstall" to "xlOS" — site name,
  disclaimers, page titles, OG images, install snippets, and SVG wordmarks.
  External environment variables (`GROKINSTALL_TELEMETRY`, `GROK_INSTALL_TOKEN`)
  intentionally preserved for backward compatibility.
- Cinnabar Glass v1.1 banner: metallic wordmark gradient, 24-ray light system,
  multi-pass bloom, and stronger atmospheric effects.
- Browser extension icons rasterized to `icon-{16,32,48,128}.png` for Manifest v3
  compliance; CI verifies PNG/SVG parity.
- Brand spec frozen in `assets/brand/` (Cinnabar Glass v1.0 — halide palette and
  typography tokens).

### Packaging & Distribution

- **PyPI publication fixed** — replaced deprecated
  `license = { text = "Apache-2.0" }` with the PEP 639 SPDX string
  `license = "Apache-2.0"` so `twine check` passes.
- **Tag-driven release automation** — `.github/workflows/release.yml` builds
  wheels for Python 3.11 and 3.12, publishes to PyPI on `v*.*.*` tags, attaches
  artifacts to a GitHub Release, and optionally redeploys the marketplace to
  Vercel.
- CLI entry point `xlos = "xlos.cli:main"` (click + rich). The wheel bundles
  `schema.json` and `constitution.md` as package resources.
- `spec/v2.14/schema.json` and the 33-agent catalog vendored from
  grok-install-v2 (22 creator agents, 4 finance agents, 7 super-agents).
- Marketplace builds 88 static pages with all 33 agents indexed.

### Documentation

- README expanded to a full v1.0 quickstart: feature list, cross-platform support
  matrix, and links to docs.
- `docs/constitution/index.md` documents the 8 articles, 24 named checks, and 3
  severity levels.
- `docs/migration/v215-to-v214-extensions.md` explains the v2.15 → v2.14
  extensions mapping.
- `RELEASING.md` documents the release process, required secrets, verification
  steps, and rollback procedure.
- Policy files added: Apache-2.0 `LICENSE` (2026 AgentMindCloud),
  `CONTRIBUTING.md`, and `SECURITY.md`.

### Breaking Changes

None. xlOS is the 2026 successor to grok-install; this is the first stable
release under the new name.
