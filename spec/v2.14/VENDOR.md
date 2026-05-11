# spec/v2.14 vendor record

This directory holds a vendored snapshot of the grok-install v2.14 spec. The
upstream is the canonical source of truth; xlOS validates manifests against
the snapshot below.

## Source

- Repository: `AgentMindCloud/grok-install-v2`
- Branch: `main`
- Commit: `d972658233d29016c6d074581b0f32bfdeff7fac`

## Files vendored

| File | Source path |
|---|---|
| `schema.json` | `spec/v2.14/schema.json` |
| `README.md` | `spec/v2.14/README.md` |
| `extensions/README.md` | `spec/v2.14/extensions/README.md` |

## Integrity

`schema.json` sha256:

```
96c2cbcb82fc4f5056bd4f74edfff6a883ec74266b65c1c0bd7492d1c336f73d
```

## Refresh policy

Do not edit any vendored file in-place. To refresh, open a new PR titled
`chore(spec): refresh vendored v2.14 from grok-install-v2` that:

1. Re-fetches each file listed above from the upstream `main` branch.
2. Updates the commit SHA and sha256 in this `VENDOR.md`.
3. Re-runs the agent migration validator to confirm all vendored agent
   manifests still pass.
