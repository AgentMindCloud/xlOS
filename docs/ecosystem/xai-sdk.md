---
title: xAI SDK
description: How grok-install integrates with the official xAI Python SDK.
---

# xAI SDK

The `xai-sdk` is the default execution backend when `llm.provider: xai`
(or no provider is set). `grok-install` never re-implements the SDK —
it wraps it, so your SDK version and your runtime version can upgrade
independently.

## Installation

```bash
pip install xlos xai-sdk
```

This installs xlOS plus the xAI SDK. xlOS does not pin a specific SDK
version, so use whichever release matches your runtime requirements.

## Model selection

```yaml
# grok-install.yaml
model: grok-4
```

Overridable per agent:

```yaml
# .grok/grok-agent.yaml
agents:
  - id: researcher
    model: grok-4                # best quality
  - id: summarizer
    model: grok-4-mini           # faster, cheaper
```

## Passing SDK options

```yaml
llm:
  provider: xai
  model: grok-4
  options:
    max_completion_tokens: 4096
    reasoning_effort: high
```

Anything under `options:` is passed through to the SDK's
`client.chat.completions.create()` call unchanged. Check the
[xAI SDK docs](https://docs.x.ai) for the current option list.

## Direct SDK access in tools

Inside a tool, you can import the SDK directly if you need raw access:

```python
from xai_sdk import Client

def summarize(text: str) -> str:
    client = Client()
    resp = client.chat.completions.create(
        model="grok-4-mini",
        messages=[{"role": "user", "content": f"Summarize: {text}"}],
    )
    return resp.choices[0].message.content
```

The runtime handles auth, retries, and rate limiting; your tool just
calls the SDK.

## Compatibility

| `xlos`   | `xai-sdk`  | Notes                           |
| -------- | ---------- | ------------------------------- |
| `>=1.0`  | `>=0.4.0`  | Current.                        |
