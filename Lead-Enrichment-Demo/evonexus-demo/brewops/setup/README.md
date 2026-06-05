# Build Your Own: Setup Guide

This folder gets you from "I watched the talk" to "I have a lead-enrichment pipeline running for *my* business." Pick a **friction tier** based on how much you want to set up vs. how much leverage you want back.

> The pipeline is the same at every tier: definitions → discovery → enrichment → scoring → human gate → write. What changes is **who runs the loop**, you, your laptop, or the cloud.

## Choose your path

| | **Path A: Copilot** | **Path B: Local Agent** | **Path C: Always-On Agent** |
|---|---|---|---|
| **Tool** | Claude.ai Project or Custom GPT | Claude Code / Cowork (on your machine) | OpenClaw / Hermes (self-hosted) · or Agent SDK |
| **Setup time** | ~5 min | ~30–45 min | ~half a day |
| **Who is the "runtime"** | **You** (paste in, paste out) | **Your laptop** (real tools, you approve) | **A scheduled job** (runs itself) |
| **API keys needed** | None (maybe 1) | A few | All of them + a host |
| **Real tool calls?** | No: you do them by hand | Yes, web search, Notion, email lookup | Yes, unattended |
| **Writes to a CRM?** | You copy/paste | Yes, after you approve | Yes, with the same gate |
| **Runs on a schedule?** | No | On demand | Yes (cron) |
| **Good for** | Understanding the shape; one lead at a time | Actually working your pipeline weekly | A real, always-on system |
| **Guide** | [path-a-copilot.md](path-a-copilot.md) | [path-b-claude-code.md](path-b-claude-code.md) | [path-c-cloud-agents.md](path-c-cloud-agents.md) |

**Recommended for the working session:** start at **Path A** to feel the loop in 5 minutes, then graduate to **Path B**, that's the tier that mirrors how Novara actually runs this.

## The tooling you'll wire up (and why)

Same toolbox from the talk. You don't need all of it to start, the *italic* ones are optional.

| Tool | Job in the pipeline | Key guide |
|---|---|---|
| **Anthropic API (Claude)** | The model that runs the orchestrator + workers | [reference-api-keys.md](reference-api-keys.md#anthropic) |
| **Web search** | Discovery + enrichment (find shops, people, signals) | [reference-api-keys.md](reference-api-keys.md#web-search) |
| **Notion** (or Airtable/Sheets) | The CRM, your system of record / state memory | [reference-api-keys.md](reference-api-keys.md#notion) |
| **Filesystem** | Inject your `definitions/` files as context | built into Claude Code; see Path B |
| **Hunter.io** | Find + verify contact emails | [reference-api-keys.md](reference-api-keys.md#hunter) |
| *PostHog* | *Inbound signal, are they already on your site?* | [reference-api-keys.md](reference-api-keys.md#posthog) |

## Templates (copy these into your project)

- [`templates/.env.example`](templates/.env.example), every secret, as a placeholder. Copy to `.env`, fill in, **never commit it.**
- [`templates/.mcp.json`](templates/.mcp.json), Claude Code MCP server config (Notion, web, filesystem)
- [`templates/claude_desktop_config.json`](templates/claude_desktop_config.json), same, for the Claude Desktop app
- [`templates/settings.json`](templates/settings.json), Claude Code permission allowlist (fewer prompts)
- [`templates/orchestrator-prompt.md`](templates/orchestrator-prompt.md), the system prompt that turns a model into the BrewOps orchestrator

## One rule before you touch a key

> **Secrets go in `.env` (or a real secret store) and `.env` goes in `.gitignore`. Always.**

Never paste an API key into a file you'll commit, a chat you'll share, or a slide. Every template here uses `REPLACE_ME` placeholders. If you ever leak a key, rotate it immediately at the provider. A starter `.gitignore`:

```
.env
.env.*
!.env.example
*.local
secrets/
```
