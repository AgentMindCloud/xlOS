<!--
  Copyright 2026 AgentMindCloud
  Licensed under the Apache License, Version 2.0
  http://www.apache.org/licenses/LICENSE-2.0
-->

# Browser extension icons

SVG sources only. Chrome MV3 manifests do **not** accept SVG icons — the
`icons` block in `../manifest.json` references PNG paths
(`icon-16.png`, `icon-32.png`, `icon-48.png`, `icon-128.png`) that must
be generated locally before packing the `.crx`.

## Source files

| File             | Purpose                                                       |
|------------------|---------------------------------------------------------------|
| `icon.svg`       | 128×128 master                                                |
| `icon-128.svg`   | 128×128 export-ready variant                                  |
| `icon-48.svg`    | 48×48 export-ready variant                                    |
| `icon-32.svg`    | 32×32 export-ready variant (heavier stroke for readability)   |
| `icon-16.svg`    | 16×16 export-ready variant                                    |

## One-time PNG conversion

ImageMagick works cross-platform:

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
