<!--
  Copyright 2026 AgentMindCloud
  Licensed under the Apache License, Version 2.0
  http://www.apache.org/licenses/LICENSE-2.0
-->

# Browser extension icons

PNG copies (`icon-16.png`, `icon-32.png`, `icon-48.png`, `icon-128.png`) are
committed alongside the SVGs because Chrome MV3 does not accept SVG icons.
The `release.yml` workflow re-rasterizes them on tag pushes as a safety net
so the checked-in PNGs cannot drift from the SVG sources.

## Source files

| File             | Purpose                                                       |
|------------------|---------------------------------------------------------------|
| `icon.svg`       | 128×128 master                                                |
| `icon-128.svg`   | 128×128 export-ready variant                                  |
| `icon-48.svg`    | 48×48 export-ready variant                                    |
| `icon-32.svg`    | 32×32 export-ready variant (heavier stroke for readability)   |
| `icon-16.svg`    | 16×16 export-ready variant                                    |

## Re-generating PNGs locally

`rsvg-convert` (from librsvg) is fastest and matches what CI uses:

```bash
cd extensions/browser/icons
for sz in 16 32 48 128; do
  rsvg-convert -w $sz -h $sz icon-$sz.svg -o icon-$sz.png
done
```

Install hints: `sudo apt-get install librsvg2-bin` (Linux) or
`brew install librsvg` (macOS).

ImageMagick works cross-platform as an alternative:

```bash
cd extensions/browser/icons
magick icon-16.svg  -background none -resize 16x16   icon-16.png
magick icon-32.svg  -background none -resize 32x32   icon-32.png
magick icon-48.svg  -background none -resize 48x48   icon-48.png
magick icon-128.svg -background none -resize 128x128 icon-128.png
```

Install ImageMagick if needed: `winget install ImageMagick.ImageMagick`
(Windows), `brew install imagemagick` (macOS), or your distro's package
manager (Linux).
