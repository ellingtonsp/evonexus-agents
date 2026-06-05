# Path A: Copilot (chatbot, ~5 minutes)

**The idea:** *you* are the runtime. The chatbot is the brain; you are the hands. You paste a lead in, the model scores and drafts using the definitions you gave it, you do the web lookups and the CRM writes yourself. Lowest friction, lowest leverage, but you'll feel the whole loop in five minutes, and it costs nothing beyond a Claude.ai or ChatGPT account.

## What you need

- A Claude.ai account (Free or Pro) **or** a ChatGPT account (Plus for Custom GPTs).
- The `definitions/` files from this kit. That's it. No API keys.

## Option 1: Claude.ai Project (recommended)

1. Go to **claude.ai** → left sidebar → **Projects** → **Create Project**. Name it "BrewOps Lead Desk."
2. Open the project → **Add content** to the project knowledge. Upload all six files from `brewops/definitions/`:
   `lead.md`, `prospect.md`, `icp.md`, `buyer-roles.md`, `state-machine.md`, `glossary.md`.
3. Set the **project instructions** (the gear / "Set instructions"): paste the contents of [`templates/orchestrator-prompt.md`](templates/orchestrator-prompt.md).
4. Start a chat in the project: *"Here's a lead: Lighthouse Coffee Roasters, Portland OR. Walk it through the pipeline."*

The project knowledge means every chat already "knows" your definitions, that's the injectable-context idea from the talk, done the no-code way. Claude can also **search the web** in the chat to do real discovery/enrichment, so this tier is more capable than a pure copy-paste.

## Option 2: Custom GPT (ChatGPT Plus)

1. **chatgpt.com** → **Explore GPTs** → **Create**.
2. In **Configure**: paste [`templates/orchestrator-prompt.md`](templates/orchestrator-prompt.md) into Instructions.
3. **Knowledge** → upload the six `definitions/` files.
4. **Capabilities** → enable **Web Search**. (Leave Code Interpreter on if you want it to compute scores for you.)
5. Save (just for you). Open it and paste a lead.

> Advanced: a Custom GPT **Action** can call a real API (e.g., your Notion). That's a step toward Path B but lives in ChatGPT. For the session, skip Actions, the friction isn't worth it; graduate to Path B instead.

## What you do by hand (the limitations, honestly)

This tier has **no reliable, governed tool use**, so you are the gates:

- **Discovery / enrichment:** the model can web-search, but you steer it and paste back anything it can't reach. Email-finding (Hunter) is manual.
- **Scoring:** ask it to score against `icp.md`; double-check the math (it's a chatbot, not a calculator, or turn on Code Interpreter).
- **The human gate:** that's just... you, in the chat. Natural fit.
- **The CRM write:** you copy the final record into your Notion/Airtable/Sheet by hand.
- **No memory of past runs / no eval loop:** each chat is fresh. No self-tuning.

## When to graduate

The moment you find yourself doing the same paste-search-paste dance for the 3rd lead, you want the machine to hold the loop. Go to **[Path B](path-b-claude-code.md).**
