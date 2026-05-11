# assets/brand/

The xlOS visual identity. Lineage is Apache-2.0. The system is intentionally
minimal — no third-party animated banner services, no typing-effect headers,
no status-emoji rows.

xlOS is the developer-product sibling of
[`grok-install-v2`](https://github.com/AgentMindCloud/grok-install-v2): a
cross-platform CLI / runtime / safety scanner for Grok agents on X. The
brand reflects that — a calmer, more technical aesthetic intended to sit
behind a terminal rather than a marketing surface.

## Palette — halide

xlOS uses the **halide** palette from the Residual Frequencies design
system: cool cyan-blue on a near-black plate. Halide is the technical
sibling of the warm cinnabar palette used by `grok-install-v2` — same
structural grammar (lab plates, registration crosses, frequency curves,
monospace-forward type), different temperature.

| Token             | Hex       | Use                                         |
| ----------------- | --------- | ------------------------------------------- |
| `--bg`            | `#060a0d` | Plate background.                           |
| `--bone`          | `#c6dde8` | Primary readable cool-bone on dark.         |
| `--bone-dim`      | `#8fb0bf` | Secondary text, muted labels.               |
| `--bone-faint`    | `#5a7785` | Hairline rules, dividers, faint UI.         |
| `--grid`          | `#d8eef5` | Plate grid wash (used at low alpha).        |
| `--accent`        | `#2bb3d4` | Halide cyan-blue — sole accent. Sparingly.  |

### Why halide for xlOS

- xlOS is a developer tool — a CLI, a validator, a safety scanner. Cool
  cyan-blue reads as "instrument", "console", "diagnostic" and stays out
  of the way of the code it sits next to.
- Cinnabar is reserved for `grok-install-v2`, the public-facing standards
  repo and landing site. Halide keeps the two products visibly distinct
  without breaking family.
- Of the four RF palettes (amber, cinnabar, halide, parchment), halide is
  the one explicitly tuned for technical surfaces (terminals, dashboards,
  diagnostic output). Amber would have over-warmed the developer
  experience; parchment was too quiet for a hero asset.

## Typography

Same as `grok-install-v2`, for family cohesion:

- **Instrument Serif**, italic 400 — display / plate titles only.
- **IBM Plex Mono**, regular 400 + bold 700 — body, code, labels.

The pre-RF sans + dev-mono stack is retired; do not re-introduce it.
See [`typography.md`](typography.md) for the rules.

## Files

- [`tokens.json`](tokens.json)   — design tokens, DTCG format.
- [`colors.css`](colors.css)     — CSS custom-properties mirror.
- [`typography.md`](typography.md) — typography spec and rules.

## Source of truth

The full Residual Frequencies design system (all four palettes, plate
templates, banner generators) lives in
[`AgentMindCloud/grok-install-brand`](https://github.com/AgentMindCloud/grok-install-brand).
The files in this directory are the xlOS-specific subset (halide palette,
typography pointers) — anything not present here should be sourced from
that repo.

The xlOS hero banner is at [`assets/banner.svg`](../banner.svg) (sibling
to this directory).
