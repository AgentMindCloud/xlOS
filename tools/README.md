# tools

Twelve X-native single-page tools that ship with xlOS. Each tool lives in
its own directory and is fully self-contained — open `index.html` (or
`src/index.html` for #19) directly in a browser to run it.

The numeric prefixes are stable identifiers preserved from the upstream
toolkit so existing references and bookmarks keep working.

| #  | Tool                                  | Description                                                                       | Status | Local path                                              |
|----|---------------------------------------|-----------------------------------------------------------------------------------|--------|---------------------------------------------------------|
| 03 | Contextual Reply Suggester            | Reply suggestions ranked by likelihood of follower gain.                          | Spec   | `tools/03-contextual-reply-suggester/`                  |
| 04 | Pre-Post Virality Scorer              | Score your draft post before you hit send.                                        | HTML   | `tools/04-pre-post-virality-scorer/`                    |
| 05 | Pinned Post A/B Rotator               | Rotate your pinned post on a schedule. Find your best converter.                  | HTML   | `tools/05-pinned-post-ab-rotator/`                      |
| 06 | Digital Product Storefront            | Sell digital products from your X bio link in 2 minutes.                          | Spec   | `tools/06-digital-product-storefront/`                  |
| 07 | Content Compound Calculator           | See your true cumulative reach over 12 months. Not just one-day impressions.      | HTML   | `tools/07-content-compound-calculator/`                 |
| 11 | Ghostwriter Mode with Memory          | AI writer that learns your voice from your last 500 posts.                        | Spec   | `tools/11-ghostwriter-mode-with-memory/`                |
| 12 | Controversy Detector                  | Flag risky phrasing before you post. Choose your battles.                         | HTML   | `tools/12-controversy-detector/`                        |
| 13 | Thread-to-Newsletter Auto-Converter   | Your thread is half a newsletter. Let's finish the job.                           | Spec   | `tools/13-thread-to-newsletter-converter/`              |
| 16 | Follower Migration Assistant          | Pivoting your account? See who'll stay and who'll leave.                          | Spec   | `tools/16-follower-migration-assistant/`                |
| 17 | Post Necromancer                      | Your old posts had good ideas. Reincarnate them with today's vocabulary.          | Spec   | `tools/17-post-necromancer/`                            |
| 19 | Grok Thread Composer                  | Write threads grounded in what's actually happening on X right now.               | HTML   | `tools/19-grok-thread-composer/` (entry: `src/index.html`) |
| 20 | X Articles Optimizer                  | Your best thread is a half-written X Article. Let's complete it.                  | Spec   | `tools/20-x-articles-optimizer/`                        |

## Status legend

- **HTML** — interactive single-page tool, opens directly in a browser.
- **Spec** — design document and contract; implementation pending.

## Running a tool locally

```bash
# macOS
open tools/04-pre-post-virality-scorer/index.html

# Linux
xdg-open tools/04-pre-post-virality-scorer/index.html

# Windows
start tools\04-pre-post-virality-scorer\index.html
```
