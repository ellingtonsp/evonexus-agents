# BrewOps: Demo Teaching Kit

A fake company used to teach the lead-enrichment pipeline end-to-end, without exposing real customer data.

**The company:** BrewOps sells back-of-house operations software (inventory, staff scheduling, vendor ordering) to **independent coffee shops**. Pre-revenue, founder-led sales. Sound familiar? It's the same *shape* as Novara selling a Patient CRM to fertility clinics, just a domain everyone in the room already understands.

| BrewOps (teaching) | Novara (real) |
|---|---|
| Independent coffee shops | Independent fertility clinics |
| Café owner / manager (operational buyer) | Practice manager (operational buyer) |
| Head barista / shift lead (gatekeeper) | Front desk / coordinator (gatekeeper) |
| "Now hiring a shift lead" + 2nd location | "Hiring an IVF coordinator" + new location |
| Square / Toast POS (incumbent tech) | eIVF / nAble EMR (incumbent tech) |

## What's in here

### `definitions/`: the "core memory" (injectable context modules)

These are the durable, single-concept files the orchestrator injects into a worker's context *only when that worker needs them*. This is the heart of the talk's "core memories" point: you don't put all of this in one giant system prompt, you author small, named, single-responsibility docs and pull them in just-in-time.

- `lead.md`: what a *lead* is to this system
- `prospect.md`: what a *prospect* is, and what promotes a lead to one
- `icp.md`: the Ideal Customer Profile **as a literal scoring rubric**
- `buyer-roles.md`: champion / decision-maker / gatekeeper / influencer / end-user
- `state-machine.md`: the lifecycle states + legal transitions
- `glossary.md`: the sales vocabulary in one place

### `data/`: the end-to-end build (one fake target)

Follow a single coffee shop, "Lighthouse Coffee Roasters," through the whole pipeline:

1. `01-raw-discovery.json`: what a discovery worker emits (a raw, sparse lead)
2. `02-enriched-prospect.json`: after the enrichment workers + scoring
3. `03-human-gate-dashboard.md`: the blocking dashboard the human approves
4. `04-crm-record.md`: the durable record written after approval (the BrewOps equivalent of a Novara prospect file)

### `setup/`: build your own (attendee take-home)

Step-by-step instructions for attendees to stand up *their own* pipeline, in three friction tiers, from a zero-setup chatbot to a scheduled cloud agent. Covers how to get every API key / MCP and exactly where to put it, with copy-paste config templates.

- `setup/README.md`: choose-your-path hub (Copilot / Local Agent / Cloud Agent)
- `setup/path-a-copilot.md`: Claude.ai Project or Custom GPT, ~5 min, no keys
- `setup/path-b-claude-code.md`, Claude Code / Cowork, real tools, human-gated (mirrors Novara)
- `setup/path-c-cloud-agents.md`, self-hosted runtimes (OpenClaw / Hermes), scheduled, what Novara runs
- `setup/reference-api-keys.md`, how to get + place each key (Anthropic, web search, Notion, Hunter, PostHog)
- `setup/templates/`: `.env.example`, `.mcp.json`, `claude_desktop_config.json`, `settings.json`, `orchestrator-prompt.md`

## How to use it live

###### Open `definitions/icp.md` and `buyer-roles.md` first, these make the "tactical → technical" bridge concrete. Then walk `data/01 → 04` to show the same lead getting richer at each stage, with a human gate before anything is written.
