# spec/v2.14/ — vendor record

This directory is **vendored** from the canonical source of truth at
[AgentMindCloud/grok-install-v2](https://github.com/AgentMindCloud/grok-install-v2).

Do **not** edit `schema.json` here. Refresh by opening a new PR titled
`chore(spec): refresh vendored v2.14 from grok-install-v2`.

## Vendor source

- Repo: `AgentMindCloud/grok-install-v2`
- Branch: `main`
- Commit at vendor time: `d972658233d29016c6d074581b0f32bfdeff7fac`
- Source path: `spec/v2.14/schema.json`

## Integrity

- `schema.json` sha256: `96c2cbcb82fc4f5056bd4f74edfff6a883ec74266b65c1c0bd7492d1c336f73d`

The schema is `additionalProperties: true` at the root and at the `extensions`
sub-object, per `grok-install-v2` DECISIONS.md D5 (unknown top-level keys and
unknown `extensions:` sub-keys are accepted by conformant parsers).

## Refresh procedure

1. `curl -sL https://raw.githubusercontent.com/AgentMindCloud/grok-install-v2/main/spec/v2.14/schema.json -o spec/v2.14/schema.json`
2. Re-compute `sha256sum spec/v2.14/schema.json`.
3. Update the commit sha and sha256 above.
4. Re-run `pytest` and `python -m xlos validate ...` against every agent under
   `agents/` to confirm none broke.
5. Open a PR titled `chore(spec): refresh vendored v2.14 from grok-install-v2`.
