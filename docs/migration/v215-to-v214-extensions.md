# v2.15 → v2.14 + extensions field mapping

The grok-agent template catalog was authored against a draft v2.15 schema.
xlOS vendors the stable v2.14 schema from `grok-install-v2`. This document
captures the field-by-field migration applied during Phase 3b.

## Mapping table

| v2.15 field | v2.14 destination | Notes |
|---|---|---|
| `metadata.constitution_articles` | `extensions.constitution` | Carried over as an array of article references (the v2.14 schema accepts either array or object form). |
| `multi_agent.role` | `extensions.multi_agent_roles` | Roles array preserved verbatim. |
| `provenance.*` | `extensions.provenance` | Nested provenance object preserved verbatim; permissive `additionalProperties: true`. |
| `metadata.demo_video.*` | `extensions.demo_metadata` | If the embedded `url` returns 404 on HEAD, `status: deferred` is set instead of committing a broken link. |
| `cost_caps` | `cost_limits` | Field rename. Top-level field; the vendored v2.14 schema is permissive at the root so the new key validates. |
| `kind: super-agent` | `category: super-agent` | Top-level field rename; same value space. |
| `kind: x-money-tool` | `category: x-money-tool` | Same value. |
| `kind: creator-template` | `category: creator-template` | Same value. |

## Schema compatibility note

The v2.14 schema declares `additionalProperties: true` at the manifest root
and at `extensions`. As a result, unknown top-level fields (`category`,
`cost_limits`) and unknown extension blocks pass validation. The xlOS
runtime treats them as first-class data even though the schema does not
publish their detailed shape.

## Fields that do not survive the migration

- `metadata.author_x_handle`, `metadata.author_twitter_handle`,
  `metadata.author_grok_handle`: dropped if present. v2.14 does not have
  a published shape and xlOS does not surface them.
- Any `xai-built-for` boilerplate (description prefixes / suffixes) is
  stripped.

## Targets normalisation

The v2.14 `deploy.targets` enum is `[action, ide, worker, web]`. Source
manifests that target `cli` or `streamlit` are retargeted to `worker` (CLI
flows) or `web` (browser-resident UI). Retargeting is recorded in the
Phase 3b verification report.
