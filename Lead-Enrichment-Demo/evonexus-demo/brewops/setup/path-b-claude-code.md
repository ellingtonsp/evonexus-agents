# Path B: Local Agent (Claude Code / Cowork, ~30–45 minutes)

**The idea:** your laptop runs the loop. The model actually calls tools, web search, Notion, email lookup, and **stops at the human gate for you to approve** before it writes. This is the tier that mirrors how Novara runs the real pipeline. You stay in the loop; the machine does the legwork.

> Claude Code is the CLI/agent. **Cowork** is the same engine in a friendlier desktop surface. The setup below is written for Claude Code; Cowork uses the same MCP and settings files, so it all carries over.

## 0. Prerequisites

- **Node.js 18+**: check with `node -v`. Install from nodejs.org if missing.
- A terminal you're comfortable in.
- An **Anthropic account**. Claude Code can authenticate two ways:
  - **Subscription login** (Pro/Max), run `claude` and follow the browser login. No API key to manage. Easiest.
  - **API key**: set `ANTHROPIC_API_KEY` (see [reference-api-keys.md](reference-api-keys.md#anthropic)). Pay-as-you-go.

## 1. Install Claude Code

```bash
npm install -g @anthropic-ai/claude-code
claude --version
```

## 2. Make your project

```bash
mkdir brewops-pipeline && cd brewops-pipeline
# copy this kit's definitions into the project so the agent can read them
cp -r /path/to/brewops/definitions ./definitions
```

Create your secrets file from the template and fill it in:

```bash
cp /path/to/brewops/setup/templates/.env.example .env
# open .env and paste your real keys
echo ".env" >> .gitignore
```

## 3. Get your keys (only what you need to start)

Minimum to do real work: **web search** + **Notion**. Add **Hunter** when you want emails. Full how-to-get-each in [reference-api-keys.md](reference-api-keys.md). Put them all in `.env`.

| Want to… | Need |
|---|---|
| Find shops / signals | Web search, built-in `WebSearch` (no key) **or** a Tavily key |
| Read/write your CRM | A Notion integration token + share your DBs with it |
| Find emails | A Hunter.io key |

## 4. Wire up MCP servers

MCP is how the agent reaches Notion, the web, and your files. Copy the template into your project as `.mcp.json`:

```bash
cp /path/to/brewops/setup/templates/.mcp.json ./.mcp.json
```

It references keys via `${VAR}`, which Claude Code expands from your environment. Load `.env` before launching (e.g. `set -a; source .env; set +a`), or export the vars in your shell profile.

**Notion: two ways:**

- **Hosted (easiest, OAuth):**
  ```bash
  claude mcp add --transport http notion https://mcp.notion.com/mcp
  ```
  Then run `claude`, and `/mcp` to complete the browser OAuth. No token to manage.
- **Self-hosted (token):** the `.mcp.json` template includes a `notion` entry using `@notionhq/notion-mcp-server` + your `NOTION_TOKEN`. Either works; the hosted one is less fiddly.

> **Critical Notion step:** an integration can only see databases you **explicitly share with it.** In Notion, open each CRM database → **•••** → **Connections** → add your integration. Skip this and every query comes back empty.

**Web search:** Claude Code ships a built-in `WebSearch` tool, you may not need an MCP at all. The `.mcp.json` also includes an optional Tavily entry if you want a dedicated search API.

**Filesystem:** the built-in file tools already let the agent read `./definitions/`. The template includes an explicit filesystem MCP scoped to your project folder if you prefer it.

Verify everything connected:

```bash
claude
# then inside the session:
/mcp        # lists servers and connection status, all should be "connected"
```

## 5. Drop in the orchestrator instructions

Claude Code reads a `CLAUDE.md` at the project root as standing instructions. Use the kit's orchestrator prompt as your starting point:

```bash
cp /path/to/brewops/setup/templates/orchestrator-prompt.md ./CLAUDE.md
```

Edit it so it's *your* business, not BrewOps, your ICP rubric, your regions, your CRM database IDs.

## 6. (Optional) Fewer permission prompts

By default Claude Code asks before running tools. To pre-approve the safe, read-only ones, copy the allowlist template:

```bash
mkdir -p .claude && cp /path/to/brewops/setup/templates/settings.json ./.claude/settings.json
```

Leave **write** actions (CRM creates, file writes) prompting, that's your human gate.

## 7. Run the loop

```bash
claude
```

Then, in plain English:

> "Run the lead pipeline for independent coffee shops in Portland. Discover up to 5, enrich them, score against definitions/icp.md, and show me the ranked dashboard before writing anything to Notion."

The agent will search, enrich, score, and then **stop and present**, exactly the Wave 3 gate. You reply `approve 1,3` or `edit 2: ...`, and only then does it write. That's the whole talk, running on your laptop.

## Where each key ends up (quick map)

| Key | Lives in | Read by |
|---|---|---|
| `ANTHROPIC_API_KEY` | shell env / `.env` (or skip via subscription login) | Claude Code itself |
| `NOTION_TOKEN` | `.env` → `${NOTION_TOKEN}` in `.mcp.json` (or OAuth, no token) | Notion MCP server |
| `TAVILY_API_KEY` | `.env` → `${TAVILY_API_KEY}` in `.mcp.json` | Tavily MCP (optional) |
| `HUNTER_API_KEY` | `.env` | a small script/tool the agent calls via Bash |
| `POSTHOG_*` | `.env` | optional inbound-signal script |

## When to graduate

When you're tired of being the one to *start* the run, you want it to wake up Monday at 9am and have the dashboard waiting. Go to **[Path C](path-c-cloud-agents.md).**
