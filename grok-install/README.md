# grok-install

The `grok-install/` subsection is the home of the **agent install standard**
inside xlOS. xlOS itself is the runtime + agent experience; this subsection is
the well-organized, self-contained place where the standard, its validator,
starter templates, and the hosted mint flow live.

| Folder | What it is |
|---|---|
| [`standard/`](standard/) | The `grok-install.yaml` **v2.14** standard, presented in-repo. The canonical schema is vendored read-only at [`../spec/v2.14/`](../spec/v2.14/). |
| [`validator/`](validator/) | A validator for `grok-install.yaml` files — a thin, dependency-free wrapper over the real xlOS validator + Constitution scanner. |
| [`templates/`](templates/) | High-quality starter manifests: Light and Heavy variants for creator templates and super-agents. Every template validates against v2.14. |
| [`mint/`](mint/) | The hosted mint flow: `safe-agent-builder.html` (build a safe, valid manifest in the browser) and `dashboard.html` (the honest agent-status ledger). |

## Heavy vs Light

- **Light** — `extensions.tier: light`, no `runtime_dispatch`. Zero install;
  the agent *is* a prompt that runs in-chat on Grok/X.
- **Heavy** — `extensions.tier: heavy`, `runtime_dispatch.type: python_module`.
  The full local `xlos` stack.

## Validate a manifest

```bash
python grok-install/validator/validate.py path/to/grok-install.yaml
```

This validates against `spec/v2.14/schema.json` and runs the Constitution
scanner — exactly what `xlos install` does before registering an agent.
