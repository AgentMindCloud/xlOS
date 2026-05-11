# xlOS browser extension

Right-click any v2.15 manifest YAML on x.com or twitter.com and install
it with xlOS.

## What it does

Detects v2.15 manifest YAML blocks on the page and surfaces an inline
"Install with xlOS" button next to each match. A right-click context
menu does the same for highlighted text. The popup keeps a rolling
history of the last 10 install requests for quick re-open.

## Install (developer mode)

1. Convert the SVG icons to PNG once per fresh checkout — see
   [`icons/README.md`](./icons/README.md).
2. Open `chrome://extensions` (Chrome) or `about:debugging#/runtime/this-firefox` (Firefox).
3. Enable Developer mode.
4. Click **Load unpacked** and select this directory
   (`extensions/browser/`).

## License

Apache-2.0
