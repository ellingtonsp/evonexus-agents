# Path C: Always-On Agent (self-hosted runtime, ~half a day)

**The idea:** the loop runs without you starting it. A scheduled job wakes up, runs discovery → enrichment → scoring, and leaves a dashboard waiting for your approval (or, for the cheap reversible steps, runs end-to-end under tighter automated gates). Highest setup friction, highest leverage. This is Novara's production posture, the cron stack from the talk.

> You do **not** need this to get value. Path B already works your pipeline weekly. Reach for Path C when "always-on" is worth a host and a bit of config.

## The relatable option: a self-hosted agent runtime (OpenClaw or Hermes)

The most approachable way to go always-on isn't to hand-roll infrastructure, it's to drop your pipeline onto a **self-hosted agent runtime** that already gives you persistent memory, cron scheduling, MCP tools, a skills system, and a human-in-the-loop channel out of the box:

| Runtime | What it is | Where |
|---|---|---|
| **OpenClaw** | Self-hosted agent runtime: wraps Claude (or any model) in an always-on loop with persistent memory, cron schedules, MCP tools, a skills system, and messaging channels. Built for solo operators and small teams running 24/7 business agents. **This is what Novara runs** (the "NanoClaw"/"OpenClaw" instances in the talk). | [openclaw.ai](https://openclaw.ai) |
| **Hermes** | Nous Research's **more-stable fork of OpenClaw**, same setup shape, plus persistent memory, scheduled tasks, MCP tools, and a closed learning loop (it can write its own reusable skills from experience). A good default if you'd rather trade the bleeding edge for fewer surprises. | [github.com/nousresearch/hermes-agent](https://github.com/nousresearch/hermes-agent) · [hermes-agent.nousresearch.com](https://hermes-agent.nousresearch.com) |

Either **is** the architecture from the talk, productized, OpenClaw upstream, Hermes the steadier fork. Here's the mapping, you've already built every left-hand column in Paths A/B:

| Talk concept | What the runtime gives you |
|---|---|
| Core/state memory | Built-in persistent memory store (survives across runs) |
| Definitions as injectable context | The runtime's **skills** system, your `orchestrator-prompt.md` + `definitions/` become a skill |
| Tools (web, Notion, Hunter) | **MCP** support, point it at the same servers from your `.mcp.json` |
| The waves / the loop | The runtime's scheduler + execution loop |
| Wave 3 human gate | A **messaging channel** (Slack / Telegram / etc.), it DMs you the dashboard, you reply `approve 1,3` from your phone |
| Eval loop / self-tuning | Run logging + persistent memory; Hermes can even author its own skills from what worked |

### Setup shape (both follow the same arc)

Exact commands live in each project's self-host guide (they evolve, follow the repo), but the shape is always:

1. **Self-host it.** Clone the repo and run its install (typically Docker / compose or a Node/Python setup). Run locally first, then move to a small always-on host (a cheap VPS, a Pi, or a container service).
2. **Add your model key.** Set your `ANTHROPIC_API_KEY` ([reference-api-keys.md](reference-api-keys.md#anthropic)) as the provider. Both are model-agnostic, so you can route cheaper models for the bulk work and Claude for the orchestration.
3. **Connect your tools (MCP).** Reuse the servers from [`templates/.mcp.json`](templates/.mcp.json), Notion, web search, filesystem. Same keys, same `.env`.
4. **Install your pipeline as a skill.** Drop in [`templates/orchestrator-prompt.md`](templates/orchestrator-prompt.md) and your `definitions/` as the runtime's skill/instructions.
5. **Schedule it.** Set a cron (e.g. Monday 9am) to run the discovery → enrich → score waves.
6. **Wire the human gate to a channel.** Configure it to post the ranked dashboard to Slack/Telegram and wait for your reply before any CRM write. That's Wave 3, on your phone.

### The human gate, when no one's at the keyboard

Keep the irreversible step gated. Two safe patterns:
1. **Propose, don't write**: the scheduled run posts a *dashboard* to your channel; you approve from your phone; the write happens on approval. (Easiest, safest.)
2. **Auto-write only the reversible**, let it create `To Research` rows (cheap, trivially deletable) but require human approval before any outbound action. Match automation to blast radius, exactly like Path B.

### Heads-up on self-hosting

Sovereignty has a cost: you own the host, the memory store, the secrets, and the uptime. Start on your laptop, prove the pipeline, then move to an always-on box. Keep secrets in the host's env / a secret manager, **never** in a committed file.

---

## Alternative A: Claude Agent SDK (hand-roll it in code)

If you'd rather not run a whole harness, the Agent SDK is the same engine as Claude Code as a library (TypeScript + Python). You write a small program and schedule it yourself.

```bash
pip install claude-agent-sdk        # or: npm install @anthropic-ai/claude-agent-sdk
```

```python
import anyio
from claude_agent_sdk import query, ClaudeAgentOptions

async def run():
    options = ClaudeAgentOptions(
        system_prompt=open("CLAUDE.md").read(),     # your orchestrator instructions
        allowed_tools=["WebSearch", "Read", "Bash", "mcp__notion"],
        mcp_servers={"notion": {"type": "http", "url": "https://mcp.notion.com/mcp"}},
        permission_mode="acceptEdits",
    )
    async for msg in query(
        prompt="Run the weekly lead pipeline for Portland coffee shops. "
               "Write a dashboard to Notion; do NOT create CRM records, leave them as proposals.",
        options=options,
    ):
        print(msg)

anyio.run(run)
```

Schedule with cron, GitHub Actions `schedule:`, Vercel Cron, or AWS EventBridge. More control, more glue code than a ready-made runtime.

## Alternative B: Managed Agents (Anthropic hosts it)

If you want zero infrastructure, Anthropic's **Managed Agents** run the loop in Anthropic's cloud, you define the agent (instructions, tools/MCP, schedule) and it executes hosted, with config and secrets managed on the platform. Least to babysit, least low-level control, and it's Anthropic-hosted rather than open-source/self-hosted. Check **docs.anthropic.com** for current setup and limits.

**Choosing:** OpenClaw/Hermes if you want open-source + ownership + the richest batteries-included feature set (this is the relatable pick for an indie/startup crowd) · Agent SDK if you want to embed the loop in your own code · Managed Agents if you want Anthropic to run it and you're fine being hosted.

---

## What you need beyond Path B

| Need | Why |
|---|---|
| **`ANTHROPIC_API_KEY`** (required) | Headless runs can't do the browser login, [reference-api-keys.md](reference-api-keys.md#anthropic) |
| **A host** | A small always-on box (VPS / Pi / container) for the self-hosted runtime, or the SDK cron, or none for Managed |
| **A secret store** | Host env vars, GitHub Actions secrets, etc., never a committed file |
| **A control channel** | Slack/Telegram (or similar) so the human gate reaches you when you're away |

## The eval loop stops being optional here

In Paths A/B you watch every run, so you catch problems live. In Path C the runs happen while you sleep, so the **self-eval + run log + next-run synthesis** from the talk become how you keep an unattended system from drifting. OpenClaw gives you the memory and logging primitives and you wire the loop; Hermes (the Nous Research fork) leans further in, able to author its own skills from what worked. Either way: log each run's results, and have the next run read the last N before it starts (Novara logs to a "Cron Runs" database for exactly this). That's the difference between "a cron that emails you noise" and "a system that gets better every week."

## Honest scoping

- Start by running your **Path B** orchestrator on a **weekly schedule that only proposes** (never auto-writes). 80% of the value, little risk.
- Add auto-writes for the cheapest, most-reversible step only once you trust the proposals.
- Keep a human approving anything outward-facing (emails, messages) indefinitely. Autonomy is a dial, not a switch.
