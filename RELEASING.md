# Releasing xlOS

This document covers cutting an xlOS release. Tag pushes trigger
`.github/workflows/release.yml`, which builds wheels, publishes to PyPI,
attaches artifacts to the GitHub Release, and (optionally) redeploys the
marketplace to Vercel production.

## Cutting a release

1. Bump `version` in `pyproject.toml` (semver: 1.0.0, 1.0.1, 1.1.0, 2.0.0)
2. Update `CHANGELOG.md` — move Unreleased entries under a new `## [1.0.0] - YYYY-MM-DD` heading
3. Commit: `git commit -am "chore(release): v1.0.0"`
4. Tag: `git tag v1.0.0 -m "v1.0.0"`
5. Push: `git push && git push --tags`
6. The `release.yml` workflow fires automatically on tag push. Watch it at https://github.com/AgentMindCloud/xlOS/actions

## Required repository secrets

Set in **Settings → Secrets and variables → Actions**:

| Secret | Where to get it | Used by |
|---|---|---|
| `PYPI_API_TOKEN` | https://pypi.org/manage/account/token/ — scope to "Project: xlos" once the project exists; first release needs an account-wide token then scope down | publish-pypi |
| `VSCE_PAT` | https://dev.azure.com — Personal Access Token with Marketplace > Manage scope | publish-vsix (only once `extensions/vscode/` ships a `package.json` with a `publisher` field) |
| `VERCEL_TOKEN` | https://vercel.com/account/tokens — scope to the xlos-marketplace project | redeploy-marketplace (optional — workflow skips cleanly if absent) |

## Required GitHub environments

**Settings → Environments** — create:

- `pypi-production` (optionally add required reviewers for a manual approval gate before each PyPI publish)
- `vscode-marketplace` (optionally add required reviewers; only needed once VSIX publish is enabled)

## Verifying a release succeeded

- PyPI: visit https://pypi.org/project/xlos/ — new version listed
- `pip install xlos==X.Y.Z` in a clean venv, then `xlos --version`
- VSCode Marketplace: search "xlOS" or visit the publisher page (once VSIX publish is enabled)
- GitHub Releases page lists the new tag with wheel + sdist (and VSIX, once enabled) attached
- Marketplace site: visit the production URL — version footer matches

## Rolling back

- PyPI: cannot delete a version, but can `pip install xlos==<previous>` to roll users back; yank the bad version via `pypi yank` (https://pypi.org/help/#yanked) so it stops being installed by default
- VSCode Marketplace: unpublish via `vsce unpublish`
- Vercel: redeploy a previous commit from the dashboard
- Always cut a v(N+1)-hotfix tag with the fix rather than relying on rollback alone

## Hotfix flow

For patch fixes: branch off the tag, fix, tag v1.0.1, push. `release.yml` handles the rest.
