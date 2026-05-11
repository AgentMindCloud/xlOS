# Vendored spec/v2.14/

This directory is a verbatim mirror of `spec/v2.14/` from the
[`grok-install-v2`](https://github.com/AgentMindCloud/grok-install-v2) repository
at the time of vendor. It is xlOS's local copy of the grok-install agent
manifest specification version 2.14, used to validate manifests at install time
and in CI.

## Source

- Repo: `AgentMindCloud/grok-install-v2`
- Branch: `main`
- Repo head commit at vendor time: `d972658233d29016c6d074581b0f32bfdeff7fac`
- Last commit touching `spec/v2.14/schema.json`: `b5001a22ebf260141124f75eeddf470ba5644f4e`
- Git blob SHA for `schema.json`: `a2db0239839e25aa886ba2b4d0177e18f31f3b7f`

## Integrity

- `schema.json` SHA-256: `96c2cbcb82fc4f5056bd4f74edfff6a883ec74266b65c1c0bd7492d1c336f73d`
- `schema.json` byte size: `4203`

To recompute:

```
sha256sum spec/v2.14/schema.json
```

## Do not edit

The vendored files (`schema.json`, `README.md`, `extensions/README.md`) are the
canonical upstream specification — `grok-install-v2` is the source of truth.
Local modifications would diverge xlOS from the wire format every other
runtime targets. If a change is needed, open the PR upstream first, then
refresh.

## Refresh procedure

To pick up upstream changes, open a new PR titled

```
chore(spec): refresh vendored v2.14 from grok-install-v2
```

with these steps:

1. Fetch the latest `spec/v2.14/` from `AgentMindCloud/grok-install-v2@main`.
2. Overwrite `schema.json`, `README.md`, `extensions/README.md`.
3. Update the commit / blob / SHA-256 fields above.
4. Run the full test suite (`pytest`) and the validate workflow locally — the
   new schema may invalidate previously-passing manifests.
