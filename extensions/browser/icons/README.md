<!--
  Copyright 2026 AgentMindCloud
  Licensed under the Apache License, Version 2.0
  http://www.apache.org/licenses/LICENSE-2.0
-->

# Browser extension icons

SVG sources only. Chrome MV3 manifests do **not** accept SVG icons — the
`icons` block in `../manifest.json` references PNG paths
(`icon-16.png`, `icon-32.png`, `icon-48.png`, `icon-128.png`) that must
be generated locally before packing the `.crx`. **These PNG files MUST
be committed for the MV3 manifest to load.**

## Palette (Cinnabar Glass)

| Token              | Value     | Role                                          |
|--------------------|-----------|-----------------------------------------------|
| `cinnabar`         | `#C73E1D` | Primary mark stroke (gradient start)          |
| `cinnabar-light`   | `#E03C31` | Hover / gradient end                          |
| `cinnabar-glow`    | `#ED5C45` | Optional radial glow (8–18 % opacity)         |
| `ink-0`            | `#0D0D0D` | Rounded background                            |
| inner highlight    | `rgba(255,255,255,0.06)` | Subtle glass border                |

## Source files

| File             | Purpose                                                       |
|------------------|---------------------------------------------------------------|
| `icon.svg`       | 128×128 master with full glow + glass highlight               |
| `icon-128.svg`   | 128×128 export-ready variant                                  |
| `icon-48.svg`    | 48×48 export-ready variant                                    |
| `icon-32.svg`    | 32×32 export-ready variant (heavier stroke for readability)   |
| `icon-16.svg`    | 16×16 export-ready variant (heaviest stroke, no glow)         |

## Expected PNG output

The manifest expects these four PNG files in this directory:

- `icon-16.png`  — 16×16
- `icon-32.png`  — 32×32
- `icon-48.png`  — 48×48
- `icon-128.png` — 128×128

## One-time rasterization

### Option A — `rsvg-convert` (preferred, pixel-perfect)

```bash
cd extensions/browser/icons
rsvg-convert -w 16  -h 16  -o icon-16.png  icon-16.svg
rsvg-convert -w 32  -h 32  -o icon-32.png  icon-32.svg
rsvg-convert -w 48  -h 48  -o icon-48.png  icon-48.svg
rsvg-convert -w 128 -h 128 -o icon-128.png icon-128.svg
```

Install: `brew install librsvg` (macOS), `apt install librsvg2-bin`
(Debian/Ubuntu), `dnf install librsvg2-tools` (Fedora), `winget install
GNOME.Librsvg` (Windows).

### Option B — ImageMagick (cross-platform fallback)

```bash
cd extensions/browser/icons
magick -background none icon-16.svg  -resize 16x16   icon-16.png
magick -background none icon-32.svg  -resize 32x32   icon-32.png
magick -background none icon-48.svg  -resize 48x48   icon-48.png
magick -background none icon-128.svg -resize 128x128 icon-128.png
```

Install ImageMagick if needed: `winget install ImageMagick.ImageMagick`
(Windows), `brew install imagemagick` (macOS), or your distro's package
manager (Linux).

After running either option, commit the four PNG files so Chrome can
load the unpacked extension.
