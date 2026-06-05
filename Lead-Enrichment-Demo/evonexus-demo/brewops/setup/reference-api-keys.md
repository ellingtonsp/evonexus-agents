# API Keys & MCP Reference

How to get each credential, where to put it, and what it costs. **Every value here is a placeholder, replace `REPLACE_ME` with your real key, and keep it out of version control.**

Jump to: [Anthropic](#anthropic) · [Web search](#web-search) · [Notion](#notion) · [Hunter.io](#hunter) · [PostHog](#posthog)

---

<a name="anthropic"></a>
## Anthropic API (Claude)

**Job:** the model that runs the orchestrator and the workers.

**Get it:**
1. Go to **console.anthropic.com** → sign in.
2. **Settings → API Keys → Create Key.** Copy it now (you can't see it again).
3. Add a little credit under **Billing** (pay-as-you-go).

**Where it goes:**
- `.env` → `ANTHROPIC_API_KEY=REPLACE_ME`
- **Path B can skip this** entirely if you log in with a Pro/Max subscription (`claude` → browser login).
- **Path C requires it** (headless runs can't do the browser login).

**Cost:** pay per token. A lead-enrichment run is cents to low-dollars depending on how many prospects and how much web reading. Set a monthly spend limit in the console.

---

<a name="web-search"></a>
## Web search

**Job:** discovery + enrichment, finding shops, people, hiring signals, news.

**Easiest (no key):** Claude Code and the Agent SDK include a built-in **`WebSearch`** tool. Just allow it. For many pipelines this is all you need.

**Dedicated search API (optional, more control):**
- **Tavily**: built for LLMs, generous free tier. **tavily.com** → sign up → **API Keys** → copy. `.env` → `TAVILY_API_KEY=REPLACE_ME`. Used via the `tavily-mcp` server (in the `.mcp.json` template).
- **Alternatives:** Brave Search API (`brave.com/search/api`), Exa (`exa.ai`). Same pattern: get key → put in `.env` → point an MCP/tool at it.

**Cost:** built-in WebSearch is billed as normal model usage. Tavily/Brave/Exa have free tiers (hundreds–thousands of searches/mo) then paid.

---

<a name="notion"></a>
## Notion (your CRM / system of record)

**Job:** the state memory, where leads, contacts, scores, and statuses live. (Prefer Airtable or Google Sheets? Same idea, swap the MCP.)

**Get a token (self-hosted MCP path):**
1. **notion.so** → your avatar → **Settings** → **Connections** → **Develop or manage integrations** (or go to **notion.so/my-integrations**).
2. **New integration** → internal → name it "BrewOps Pipeline" → copy the **Internal Integration Secret** (starts `ntn_…` / `secret_…`).
3. `.env` → `NOTION_TOKEN=REPLACE_ME`.

**OR use the hosted MCP (no token):**
```bash
claude mcp add --transport http notion https://mcp.notion.com/mcp
```
Then complete the OAuth in-app (`/mcp`). This is the lower-friction option.

**The step everyone forgets, share your databases with the integration:**
Open each CRM database in Notion → **•••** (top right) → **Connections / Add connections** → select your integration. An integration sees **only** what you share with it. Miss this and every query returns empty (no error, just silence).

**Find your database IDs:** open a database as a full page; the URL is `notion.so/<workspace>/<DATABASE_ID>?v=…`. The 32-char hex chunk is the ID. Put these in your `CLAUDE.md`/orchestrator prompt so the agent knows which DB is which.

**Cost:** free.

---

<a name="hunter"></a>
## Hunter.io (email finding & verification)

**Job:** turn "Dana Whitfield, manager at Lighthouse" into a verified email with a confidence score.

**Get it:**
1. **hunter.io** → sign up → **API** (or **Dashboard → API**) → copy your key.
2. `.env` → `HUNTER_API_KEY=REPLACE_ME`.

**Where it goes:** there's no official Hunter MCP, the agent calls it via a small `curl`/Bash step (the `domain-search` and `email-finder` endpoints, exactly as in Novara's real SKILL). Allow `Bash(curl:*)` in your `settings.json` so the agent can run it.

```bash
curl -s "https://api.hunter.io/v2/domain-search?domain=lighthouseroasters.com&api_key=$HUNTER_API_KEY"
```

**Map confidence → your enum:** score ≥90 → "Verified", 50–89 → "Pattern-inferred", catch-all → "Catch-all", none → "Not Found". (Carry the confidence; don't collapse it.)

**Cost:** free tier ~25–50 searches/mo; paid plans scale up.

---

<a name="posthog"></a>
## PostHog (optional: inbound signal)

**Job:** detect that a discovered shop is **already** visiting your site or submitted a form, a much warmer lead. Skip this until you have a website with analytics.

**Get it:**
1. **app.posthog.com** (or your self-hosted instance) → **Settings**.
2. **Personal API Key:** account menu → **Personal API Keys** → create → copy. `.env` → `POSTHOG_API_KEY=REPLACE_ME`.
3. **Project ID:** Project Settings → copy the numeric project id. `.env` → `POSTHOG_PROJECT_ID=REPLACE_ME`.

**Where it goes:** like Hunter, called via a `curl`/Bash step against the PostHog events API. Boost the lead score when a matching visit or form event is found.

**Cost:** generous free tier.

---

## Putting it together

All of these land in one `.env` (see [`templates/.env.example`](templates/.env.example)). MCP-based tools (Notion, Tavily) read their keys through [`templates/.mcp.json`](templates/.mcp.json) via `${VAR}` expansion. Script-based tools (Hunter, PostHog) read straight from the environment in a `curl` step. The model never sees the raw keys, it sees the *tools*.
