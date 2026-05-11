# tools

X-native tools shipped with xlOS. **5 shipping** (4 single-file HTML +
1 hybrid) plus **7 specified** for future builds. The numeric prefixes
are stable identifiers preserved from the upstream toolkit so existing
references and bookmarks keep working.

## Shipping (5)

| #  | Tool                                  | Type             | Description                                                                  |
|----|---------------------------------------|------------------|------------------------------------------------------------------------------|
| 04 | Pre-Post Virality Scorer              | single-file HTML | Score your draft post before you hit send.                                   |
| 05 | Pinned Post A/B Rotator               | single-file HTML | Rotate your pinned post on a schedule. Find your best converter.             |
| 07 | Content Compound Calculator           | single-file HTML | See your true cumulative reach over 12 months. Not just one-day impressions. |
| 12 | Controversy Detector                  | single-file HTML | Flag risky phrasing before you post. Choose your battles.                    |
| 19 | Grok Thread Composer                  | hybrid (src/ + tests) | Write threads grounded in what's actually happening on X right now.     |

### How to run a shipping tool

The four single-file HTML tools open directly in a browser — no build,
no server. Pick your OS:

```bash
# macOS
open tools/04-pre-post-virality-scorer/index.html

# Linux
xdg-open tools/04-pre-post-virality-scorer/index.html

# Windows
start tools\04-pre-post-virality-scorer\index.html
```

Substitute `04-pre-post-virality-scorer` with `05-pinned-post-ab-rotator`,
`07-content-compound-calculator`, or `12-controversy-detector` for the
other three single-file tools.

#19 — Grok Thread Composer — is the hybrid tool. It has a Node-style
layout (`src/`, `test/`, `package.json`). Its entry point is
`tools/19-grok-thread-composer/src/index.html`. Run its tests with:

```bash
cd tools/19-grok-thread-composer
npm install
npm test
```

## Specified-only (7)

These tools ship as `SPEC.md` design documents — the contract is
nailed down, the implementation is not built. Contributions welcome.

| #  | Tool                                  | Description                                                                  |
|----|---------------------------------------|------------------------------------------------------------------------------|
| 03 | Contextual Reply Suggester            | Reply suggestions ranked by likelihood of follower gain.                     |
| 06 | Digital Product Storefront            | Sell digital products from your X bio link in 2 minutes.                     |
| 11 | Ghostwriter Mode with Memory          | AI writer that learns your voice from your last 500 posts.                   |
| 13 | Thread-to-Newsletter Auto-Converter   | Your thread is half a newsletter. Let's finish the job.                      |
| 16 | Follower Migration Assistant          | Pivoting your account? See who'll stay and who'll leave.                     |
| 17 | Post Necromancer                      | Your old posts had good ideas. Reincarnate them with today's vocabulary.     |
| 20 | X Articles Optimizer                  | Your best thread is a half-written X Article. Let's complete it.             |

Each directory contains a `SPEC.md` plus a `README.md` with the
concept summary.

## Building a specified tool

The five shipping tools are the working pattern. Two implementation
shapes are in scope:

- **Single-file HTML** — vanilla JS, one self-contained `index.html`
  that opens in any browser. See `04`, `05`, `07`, `12`.
- **Hybrid** — `src/` + `tests/` + `package.json`. See `19`. Use this
  shape when the tool needs more than ~500 lines of JS or needs unit
  tests.

Pick whichever shape fits the tool's complexity. Match the existing
naming convention (`<NN>-kebab-case-name/`) so the marketplace prerender
picks the tool up automatically.
