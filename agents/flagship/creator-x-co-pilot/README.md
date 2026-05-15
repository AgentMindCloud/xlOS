# Creator X Co-Pilot

The flagship hero experience of xlOS. One chat takes a creator from "what
should I post?" to voice-matched, ready-to-post drafts — with honest analytics
and cited context.

## Status

**Available (Light).** Zero install: paste [`light/prompt.md`](light/prompt.md)
into Grok on X. The Light tier is the default experience and is honest about
its boundary — it drafts; it has no persistent memory, no scheduling, and
never auto-posts.

**Heavy — roadmap, not shipped.** A local Heavy tier (persistent brand-voice
memory, append-only provenance, X Money context, weekly eval loop) is planned.
It is deliberately **not** claimed in the manifest until it runs end-to-end
with passing tests.

## What it composes

Light reuses the strongest patterns already in xlOS rather than reinventing
them: ideation (`content-idea-generator`), drafting (`reply-drafter`,
`thread-builder`), an analytics read (`analytics-summarizer`), and Living
Narrative Fabric's cite-everything / never-resolve-contradictions discipline
(`living-narrative-fabric-light`).
