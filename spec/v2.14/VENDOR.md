# Vendored v2.14 spec — provenance record

This directory mirrors `spec/v2.14/` from the upstream **grok-install-v2** repository. It is xlOS's vendored copy used at validation time. Treat it as **read-only** within xlOS — fixes go upstream.

## Source

- **Repository:** [`AgentMindCloud/grok-install-v2`](https://github.com/AgentMindCloud/grok-install-v2)
- **Branch:** `main`
- **Commit SHA at time of vendor:** `d972658233d29016c6d074581b0f32bfdeff7fac`

## Files vendored

| File | Source path | sha256 |
|---|---|---|
| `schema.json` | `spec/v2.14/schema.json` | `96c2cbcb82fc4f5056bd4f74edfff6a883ec74266b65c1c0bd7492d1c336f73d` |
| `README.md` | `spec/v2.14/README.md` | (verbatim mirror) |
| `extensions/README.md` | `spec/v2.14/extensions/README.md` | (verbatim mirror) |

`grok-install.yaml` is not present at the source path `spec/v2.14/grok-install.yaml` (HTTP 404) and is therefore not mirrored.

## Refresh procedure

To refresh the vendored copy to a newer upstream commit:

1. Open a new PR titled **`chore(spec): refresh vendored v2.14 from grok-install-v2`**.
2. Re-fetch each file from the upstream raw URLs at the new commit SHA.
3. Recompute and update sha256 hashes above.
4. Update the **Commit SHA at time of vendor** field above.
5. Re-run `pytest` — any agent that no longer validates must be fixed (or its manifest updated) in the same PR.

## Why this is vendored, not pinned

xlOS validates agent manifests at install time. Pulling the schema over the network at install time would create a build-time dependency on the public GitHub network and could break offline installs. The vendored copy is loaded via `importlib.resources` so it works when xlOS is shipped as a wheel.
