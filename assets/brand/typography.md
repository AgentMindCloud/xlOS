# Typography — xlOS

The xlOS visual system uses the Residual Frequencies typography stack, shared
with `grok-install-v2` for family cohesion across the AgentMindCloud product
line.

## Stack

| Role    | Family               | Weights / styles      | Purpose                              |
| ------- | -------------------- | --------------------- | ------------------------------------ |
| Display | **Instrument Serif** | Italic 400            | Plate titles, captions, hero serif.  |
| Body    | **IBM Plex Mono**    | Regular 400, Bold 700 | All running text, code, UI labels.   |

Both are self-hosted on production landing surfaces (`fonts/*.woff2`,
latin subset). For README/SVG-on-GitHub contexts, fall back to system serif
(`Georgia, serif`) and system monospace (`'Courier New', monospace`).

## Usage rules

- **Display** is italic 400 only. No roman, no bold, no other weights.
- **Body** is mono-only — no sans-serif anywhere in the product surfaces.
  Letter-spacing `0.02em` for body, `0.16em`–`0.20em` uppercase for labels.
- Numerals use IBM Plex Mono's tabular figures by default.
- The pre-RF sans + dev-mono stack was retired when the Residual
  Frequencies system landed; do not re-introduce it.

## Why this stack

- **Instrument Serif italic** carries the lab-plate / specimen aesthetic
  that anchors the RF system.
- **IBM Plex Mono** is technical, calm, and renders identically across
  GitHub, terminals, and the marketplace web surfaces — important for a
  developer product like xlOS.
- Sharing the stack with `grok-install-v2` keeps the two repos visibly
  related even though their palettes diverge (halide vs cinnabar).
