---
title: v2.14 — visuals block (current release)
description: grok-install v2.14 adds a fully additive visuals block for install-card previews. Fully backwards compatible with v2.13 validators.
---

# grok-install v2.14

v2.14 is a **purely additive** release. It introduces exactly one
thing: a `visuals:` block that declares how an agent should preview in
galleries and the install card on X.

Every v2.13 file still validates in v2.14 without changes. A v2.13
validator that encounters a v2.14 file ignores the new block — no
breakage.

!!! success "Additive by design"
    No removed fields, no renamed fields, no moved files. If you are
    on v2.13 today, adopt v2.14 when you want a preview card — not
    before.

## What's new

- **[`visuals:` block](visuals.md)** — image, GIF, video, or carousel
  + accessibility declarations + optional CTA.
- **[Migration from v2.13](migration.md)** — a drop-in YAML block.
  Zero breaking changes, 3 minutes to adopt.
- **[WCAG 2.2 AA checklist](accessibility.md)** — `alt` is required.
  Captions, transcripts, reduced-motion, contrast ratios.

## The minimum viable example

```yaml
version: 2.14.0
author: "@your-handle"
compatibility:
  - grok-install.yaml@2.14+
  - grok@2026.4+

visuals:
  type: image
  src: ./assets/card.png
  alt: "A terminal showing xlos install agents/my-agent/grok-install.yaml."
```

That's it. Everything else is optional.

## JSON Schema

The v2.14 schema is vendored under `spec/v2.14/schema.json` in the
xlOS repo and ships with every release. xlOS validates every install
against it — there is no separate "playground" service.

## Compatibility matrix

| Spec  | Runtime         | xlOS                |
| ----- | --------------- | ------------------- |
| v2.14 | grok@2026.4+    | 1.0+                |

## Still on v2.12?

v2.14 requires the v2.13 12-standard layout. Run
[v2.12 → v2.13 migration](../v2.13/migration-from-v2.12.md) first,
then [v2.13 → v2.14](migration.md).
