# Building a Lead Enrichment Pipeline with LLM Agents
### EvoNexus AI Meetup: Working Session
### Presenter: Stephen Ellington (filling in), modeled on Novara Fertility's production pipeline

---

## 0. How to run this session (presenter note)

This is a *build-along*, not a slideshow. The arc is: **start with the tactical sales problem, then show the technical machine that solves it, one layer at a time.** Every technical choice we made maps to a documented LLM best practice. Keep pointing at that bridge.

The spine of the talk is five questions. We answer each one twice: once in **sales language** (what a revenue team would say) and once in **systems language** (what the LLM engineer hears).

1. What is a lead, and what states can it be in? → **state machine + the system's memory**
2. How do we fill in what we don't know? → **enrichment**
3. What does the agent actually call? → **tools**
4. How do we stop it from doing something dumb? → **gates**
5. Where does the human sit? → **human-in-the-loop + the learning loop**

Total target: ~45 min talk + live walk-through. Each section below has a **Tactical** frame, a **Technical** frame, and the **Bridge to LLM best practice.**

---

## 1. Cold open: the problem, in sales terms (5 min)

We're a pre-revenue startup selling a Patient CRM to fertility clinics. The single most expensive, least scalable thing a founder does is **find and qualify leads**: who are the clinics, who's the right human inside them, are they even a fit, and what do I say.

A traditional org buys this as labor: an **SDR** (Sales Development Rep) doing manual research in LinkedIn, ZoomInfo, and Google, then typing rows into a CRM. It's slow, inconsistent, and the knowledge evaporates when the SDR leaves.

**The thesis of this talk:** that whole job is a *pipeline of well-scoped research and data-entry tasks with clear quality gates.* That shape, fan out, enrich, validate, get a human sign-off, learn from the outcome, is exactly what LLM agents are good at, *if you engineer the constraints.* The hard part isn't the AI. The hard part is the **state machine, the gates, and the eval loop.**

> Sound-bite: "We didn't build an AI that does sales. We built a state machine that an AI is allowed to operate, inside guardrails, with a human holding the pen at the one irreversible step."

### Sales vocabulary we'll use (define up front for the mixed audience)

| Term | Plain meaning | Why the system cares |
|---|---|---|
| **Lead** | An entity that *might* become a customer | The thing that flows through the state machine |
| **Prospect** | A lead we've decided is worth pursuing | A lead that passed the scoring gate |
| **ICP** (Ideal Customer Profile) | The fit definition: who we sell to | Encoded as a literal scoring rubric (weights + thresholds) |
| **Enrichment** | Filling in missing facts about a lead | The core LLM+tools job |
| **Lead scoring** | A number for "how good is this lead" | A deterministic function, *not* an LLM vibe |
| **Decision-maker / Champion / Gatekeeper / Influencer** | Roles a human plays in a buying decision | A classification label on each contact |
| **Warmth** (Cold/Warm/Hot) | How engaged the lead already is | Adjusted by inbound signals (web visits, demo form) |
| **Dedup** | Don't add a lead we already have | A correctness gate before any write |
| **Pipeline stage** | Where the deal is in the sales process | The states of our state machine |
| **Cadence** | The scripted sequence of outreach touches | Downstream of this pipeline; we only set it up |

---

## 2. Core memory + the state machine (10 min)

> "Before you can enrich a lead, you have to decide what a lead *is* to your system, and what it's allowed to *be*."

### 2.1 Tactical frame: a lead has a lifecycle

A lead is not a blob. It moves through stages, and at each stage different things are true and different actions are legal. In our CRM the clinic goes:

```
To Research → To Contact → Contacted → Meeting Scheduled →
In Discussion → Demo Completed → Pilot → Closed Won / Closed Lost / Gone Cold
```

Contacts (the humans) have their own parallel lifecycle:

```
To Contact → Outreach Sent → Connected → In Conversation →
Meeting Scheduled → Demo Completed → Nurturing / Gone Cold / Not Interested
```

These aren't decorations. **The status is the gate on what the agent may do.** A clinic in `To Research` is fair game for discovery and enrichment. A clinic in `In Discussion` is off-limits to an automated cold pipeline, touching it would step on a live human conversation.

### 2.2 Technical frame: the CRM *is* the agent's long-term memory

Here's the key architectural idea, and it's the one I'd most want this room to take home:

> **The system's durable memory is not in the model's context window. It's in an external, structured, queryable store, and it's split by what kind of memory it is.**

We use two layers:

- **State memory → Notion databases.** Pipeline stage, last touch, contacts, scores, signals. This is *authoritative, changes daily, and must be queried at runtime every single time.* The model never "remembers" pipeline state, it reads it fresh. (Our hard rule: *"Notion is the source of truth. Query it before relying on memory or files."*)
- **Narrative memory → markdown files.** Positioning, why we priced the way we did, what worked in past demos, the methodology. *Durable, slowly-changing context* that we inject on demand.

The state lives in five real databases:

| Database | What it holds | Role |
|---|---|---|
| Clinic Outreach | The accounts (the leads) | Entity store |
| Sales Contacts | The humans at those accounts | Entity store |
| Market Intel | Competitive/market signals | Signal feed |
| Cron Runs | Every pipeline run + its eval scores | **The learning log** |
| Cases | The activity/to-do log | The work queue |

**Schema as a contract.** Each entity has a typed schema, `Status` is a select with a fixed enum, `Size` is `Small (1-2 REIs) / Mid-size (3-8) / Large (9+)`, `Email Confidence` is `Verified / Pattern-inferred / Catch-all / Not Found`. This typed schema is what lets a non-deterministic model write into a deterministic store safely. The enum *constrains the model's output space.*

### 2.3 Bridge to LLM best practice

- **Context engineering / external memory.** Don't stuff state into the prompt and hope the model holds it. Put it in a database; read it fresh; write structured results back. The model is the *processor*, the database is the *RAM + disk*.
- **State machines tame non-determinism.** An LLM is a probabilistic next-token machine. You make it reliable by surrounding it with an explicit, finite set of states and legal transitions. The model proposes; the state machine disposes.
- **Separate "what changes daily" from "what changes quarterly."** Query the former, inject the latter. This is the single biggest lever on freshness and token cost.

> Demo moment: open the Clinic Outreach DB, show the `Status` enum and the typed fields. "This dropdown is a guardrail. The model literally cannot write `kinda interested` here."

---

## 2B. The other half of memory: definitions as injectable context modules (6 min)

> "The state machine is *runtime* memory, what's true right now. But there's a second kind of memory the system needs: *definitional* memory, what these words even mean. And the single highest-leverage decision we made was to write those definitions as small, separate files instead of one giant prompt."

### 2B.1 The mistake everyone makes first

The naive way to build this is one enormous system prompt: "You are a sales agent. A lead is... a prospect is... our ICP is... here are the buyer roles... here are the states... now go." It feels efficient. It is a trap. That monolith is hard to edit, impossible to version cleanly, blows up token cost on every call, and, counterintuitively, makes the model *dumber*, because the relevant 200 tokens are buried in 4,000 tokens of stuff this particular worker doesn't need.

### 2B.2 What we do instead: a library of single-concept definition files

We author each core concept as its own small markdown file, a **definitional module**, and the orchestrator **injects only the ones a given worker needs, when it needs them.** In the BrewOps teaching kit these are literal files:

```
definitions/
  lead.md          ← what a lead IS (entry criteria, lead vs prospect vs contact)
  prospect.md      ← the promotion rule (lead --score>=60--> prospect)
  icp.md           ← the Ideal Customer Profile AS A SCORING RUBRIC
  buyer-roles.md   ← champion / decision-maker / gatekeeper / influencer / end-user
  state-machine.md ← the states + legal transitions
  glossary.md      ← the shared vocabulary
```

Each file opens with an `inject-when:` hint, a one-line note on which worker should receive it. The contact-discovery worker gets `buyer-roles.md`. The scoring worker gets `icp.md`. Neither carries the other's baggage. This is exactly how Novara's real system works: the orchestrator injects the resolved knowledge-base path and pulls specific files (competitor profiles, prospect narratives, positioning signals) into a worker's prompt **only for the relevant topic**, never all of them at once. (Our own rule, verbatim: *"Never load all detail files at once, they are designed for on-demand context injection."*)

### 2B.3 Why this is the right call (three reasons)

1. **It's how humans onboard.** You don't hand a new SDR a 40-page bible and say "memorize." You hand them the ICP one-pager when they're qualifying, the roles cheat-sheet when they're prospecting. Same cognitive ergonomics for the model.
2. **Definitions become editable, version-controlled, testable units.** When we learn "we keep mis-scoring chains," we edit *one file*, `icp.md`, and every worker that injects it gets the fix. That's also the surface the eval loop's Tier-3 governance edits (more in §6).
3. **The ICP file is a scoring rubric, not a paragraph.** This is the subtle one. Writing the definition *as a rubric with weights and thresholds* is what lets the model gather facts while code computes the answer. The format of the definition file enforces the determinism boundary. A prose definition ("we like independent mid-size shops") would invite the model to judge; a tabular rubric forces it to *retrieve and report*.

### 2B.4 Bridge to LLM best practice

- **Context engineering / progressive disclosure / just-in-time context.** Give the model the minimum relevant context for the current step, retrieved on demand, not a kitchen-sink prompt. This is now consensus best practice for agent design.
- **Single-responsibility, composable prompts.** Treat prompt fragments like code modules: one concept per file, injected where needed, reused across workers.
- **Definitions are part of your codebase.** Version them, diff them, and let your eval loop modify them under human review. The "knowledge" of the system lives in editable files, not in the model's weights or a frozen mega-prompt.

> Demo moment: open `definitions/icp.md` and `definitions/buyer-roles.md` side by side. "These two files are the entire 'brain' of qualification and targeting. A worker that scores leads sees the first and never the second. That separation is the design."

---

## 3. Enrichment: how we fill in what we don't know (10 min)

### 3.1 Tactical frame

Enrichment is the SDR's core craft: I have a clinic name and maybe a website. I need its size, cycle volume, phone, EMR system, parent org, *and* the right human, ideally the **practice manager** (operational buyer), not the **physician** (clinical, wrong entry point). Then I need a one-paragraph reason this clinic should care, in their specific language. We call that the **Novara Angle.**

### 3.2 Technical frame: orchestrator + parallel workers, in waves

The pipeline is an **Opus orchestrator** that spawns **subagent workers**. It runs in waves:

```
Pre-flight:  detect environment, validate schema, load API keys
Wave 0:      Eval synthesis, read the last 10 runs, self-tune
Wave 1:      DISCOVERY (3 workers in parallel)
               1a SART/registry   1b hiring+expansion signals   1c market-intel cross-ref
             → phase gate: merge, DEDUP vs CRM, score, cap at 10
Wave 2:      ENRICHMENT (workers, batched 3-5 clinics each)
               2a clinic data (size, phone, EMR, parent org)
               2b contact discovery (decision-makers, emails, LinkedIn)
             → phase gate: validate, recompute score, generate Angle
Wave 3:      HUMAN GATE (blocking), present dashboard, collect approvals
Wave 4:      CRM write + log the run + self-eval + ask for feedback
```

Two design decisions worth calling out:

**Why fan out into parallel workers?** Three reasons: (1) speed, three searches at once; (2) **context isolation**, each worker has a clean, narrow context so it doesn't get confused or distracted; (3) **diverse search angles**, the SART worker, the hiring-signal worker, and the market-intel worker are *blind to each other*, so they surface leads a single search would miss. When the same clinic shows up in two workers, that's a positive signal (multi-source validation).

**Why is lead scoring deterministic code, not an LLM judgment?** The score is a fixed rubric:

| Dimension | Weight | Example |
|---|---|---|
| Cycle volume fit | 25 | 50–300 cycles = full marks |
| Size fit | 15 | Small/mid clinic > mega-network |
| Independence | 15 | Independent > PE-backed |
| Signal strength | 20 | "hiring a coordinator" = the warmest signal |
| Geographic priority | 10 | Home region first |
| Competitive landscape | 15 | No incumbent product = open field |

The LLM *gathers the evidence*; arithmetic *computes the score*. We never ask the model "is this a good lead, 0–100?" because that's unstable and unauditable. We ask it discrete, checkable facts and we do the math ourselves. Then a threshold table maps score → priority → action.

**The Angle is where we let the model be generative**, but constrained. It must reference *this clinic's specific* signals (their size, their hiring post, their EMR), with a worked good-vs-bad example in the prompt:

- Good: *"Mid-size independent, 280 cycles/yr across 4 REIs, ~70 cycles per doctor. Coordinator bottleneck. Novara automates between-visit engagement."*
- Bad: *"Fertility clinic that could benefit from patient engagement software."*

### 3.3 Bridge to LLM best practice

- **Orchestrator–worker (a.k.a. supervisor) pattern.** A planner model decomposes the job and delegates to focused workers. This is the dominant pattern for non-trivial agent systems.
- **Context isolation beats one giant prompt.** Narrow context = fewer hallucinations, lower cost, more steerable. Subagents are the unit of isolation.
- **Put determinism where correctness matters.** Scoring, dedup, math → code. Judgment, synthesis, language → model. Knowing which is which is the whole game.
- **Few-shot with good/bad exemplars** is the cheapest, highest-ROI way to control generative output quality.
- **Ground every claim in a retrieved source.** Workers cite where they found a fact (website, Hunter, LinkedIn). No source → it doesn't get written.

> Demo moment: show the Wave 1→2 architecture diagram in SKILL.md, then show one real Novara Angle from a prospect file. "The clinic-specific detail is the tell that the model actually read the research instead of pattern-matching a template."

---

## 4. Tools: what the agent actually calls (6 min)

> "An LLM with no tools is a creative writer. An LLM with tools is an operator. The tools are where it touches reality."

### 4.1 The toolbox, by job

| Job | Tool | Note |
|---|---|---|
| Find clinics & people | **WebSearch / WebFetch** | SART registry, job boards, news, LinkedIn profiles |
| Find & verify emails | **Hunter.io API** | Domain search + email finder; returns a confidence score we map to our enum |
| Detect *inbound* interest | **PostHog API** | Is this clinic *already* visiting our site or did they submit a demo form? That's a warm lead, boosts the score |
| Read/write state | **Notion API (+ MCP)** | REST for batch queries, MCP tools for single-record ops |
| Spawn workers | **The Agent/subagent tool** | The orchestrator's "fork" primitive |
| Local narrative memory | **filesystem (read markdown)** | Positioning, competitor profiles, past briefs |

### 4.2 Two things worth teaching here

**MCP (Model Context Protocol) is the USB-C of tools.** Rather than hand-coding each integration, MCP gives the model a standard way to discover and call external systems (Notion, Drive, Gmail, Linear, even a browser). We mix MCP tools with raw `curl` where the MCP server has a gap, e.g., batch Notion queries go over REST because the MCP query tool needs a higher Notion plan tier. *Lesson: MCP for ergonomics, raw API for the long tail. Have both.*

**Confidence is a first-class data type.** Hunter returns an email with a score. We don't store "the email." We store the email *and* `Email Confidence: Verified | Pattern-inferred | Catch-all | Not Found`. Downstream, a `Pattern-inferred` email gets treated differently than a `Verified` one. **Propagate uncertainty; don't collapse it.** This is one of the most underrated practices in applied LLM systems.

### 4.3 Bridge to LLM best practice

- **Tool use / function calling** is what turns a chat model into an agent. Scope tools narrowly and name them well, the model picks tools from their descriptions.
- **MCP** standardizes tool integration so you're not rewriting glue for every data source.
- **Carry confidence/provenance through the pipeline.** A fact and *how sure we are of it* are different fields. Systems that flatten that ship bad data confidently.

---

## 5. Gates: how we stop it from doing something dumb (7 min)

This is the part people skip and then regret. **A gate is a checkpoint between steps where work must pass a check before it continues.** Some gates are automated; the most important one is human. Our pipeline has four.

| Gate | Where | What it checks | If it fails |
|---|---|---|---|
| **Schema validation** | Pre-flight | Do the CRM fields we're about to write actually exist, by exact name? | **HALT.** Wrong field names create malformed records silently |
| **Dedup gate** | After discovery | Is this clinic already in the CRM? (match on SART ID, domain, fuzzy name, parent org) | Exclude exact matches; send fuzzy matches to the human |
| **Validation gate** | After enrichment | Does each prospect have the minimum viable data (website + location + 1 real contact)? | Demote to "low confidence," flag it, don't drop it silently |
| **Human gate** | Wave 3 | Does a human approve creating these records? | **No approval, no writes. No exceptions.** |

Three principles behind these:

**Fail loud, fail early.** The schema check runs *before* any work, because the worst outcome isn't an error, it's a *silent* success that writes garbage. "Never fail silently; always log to Cron Runs even on error."

**The irreversible step gets the strictest gate.** Discovery and enrichment are cheap and reversible, let the agent run free. *Writing to the system of record* is irreversible-ish and outward-facing, so it's the one we put a blocking human in front of. Match gate strictness to blast radius.

**Dedup is a correctness gate, and fuzzy matches are escalations, not autodecisions.** Exact match (same SART ID or domain) → auto-exclude. 85%-name-overlap → "I'm not sure, *you* decide." The agent is allowed to be confident when it's certain and *required to ask* when it's not.

### Bridge to LLM best practice

- **Guardrails / validators between steps.** Don't trust a model's output into the next stage, validate it (schema, presence, format) and route failures.
- **Structured output + enum constraints** make validation mechanical instead of vibes-based.
- **Idempotency & dedup** matter doubly with non-deterministic actors that might re-run or double-fire.
- **Calibrated autonomy:** automate the confident/reversible; gate the uncertain/irreversible.

> Demo moment: show the dedup logic (three match axes) and the "possible match → ask the human" branch. "This is the line between a tool that helps and a tool that quietly duplicates your CRM."

---

## 6. Human-in-the-loop + the learning loop (7 min)

Two distinct human touchpoints. People conflate them; keep them separate.

### 6.1 The approval gate (Wave 3), human as *decision-maker*

The pipeline does all the expensive work, then **stops** and presents a ranked dashboard: each prospect with its score, enriched fields, contacts, the proposed Angle, the proposed next step, and any fuzzy-match warnings. The human responds in natural language:

```
"approve all"
"approve 1,3,5"
"skip 2"
"edit 1: angle should mention their EMR migration"
"not new: 2 is the same as [existing CRM record]"
```

Then: and only then: Wave 4 writes to the CRM. The human is the pen on the irreversible action. Notice the *interface*: it's not a form, it's a conversation. The model parses intent from terse human shorthand. That's a feature you get almost for free with an LLM and it dramatically lowers the friction of staying in the loop.

### 6.2 The eval loop: human as *teacher*

After the writes, the pipeline does something most automations don't: **it grades itself, then asks the human to grade it,** and logs both to the Cron Runs database.

- **AI self-assessment first** (so the human just reacts, not writes essays): *"Prospect quality: high, lead scores averaged 78, three strong hiring signals. Enrichment: partial, 2 clinics missing phone. Angles: specific."*
- **Then a 5-question eval** with the self-assessment pre-filled. The human can just say "good" or "mostly noise" and it maps to structured fields (`Disposition`, `Prospect_Quality`, `Enrichment_Completeness`, `Angle_Quality`).

That feedback is written to the **Cron Runs log**, which feeds **Wave 0 of the *next* run.** Next time, before doing anything, the orchestrator reads the last 10 runs, builds frequency tables, and **self-tunes**:

- **Tier 1**: autonomous, per-run nudges (max 3): "Southwest was 0% for 3 runs → focus there." Written to a temp file, injected into this run's prompts.
- **Tier 2**: persistent patterns it *can't* fix alone: "Angles rated generic 3 runs running despite Tier-1 nudges → I recommend changing the angle-generation instructions. Approve / Dismiss / Defer?" Requires human sign-off.
- **Tier 3**: approved Tier-2 changes get committed to the skill file with a governance log. The system literally edits its own instructions, *with a human approving the diff.*

It also logs **what worked** ("anchor behaviors"), so self-tuning doesn't regress things that were already good.

### 6.3 Bridge to LLM best practice

- **HITL at the irreversible step** is the canonical safety pattern for agents that touch the real world.
- **Natural-language approval** is a UX superpower unique to LLM systems, lower friction = humans actually stay in the loop.
- **Evals are not optional.** A system you can't measure, you can't improve. The discipline: self-eval to reduce human effort, structured logging to make it queryable, and a feedback loop that *closes*, last run's grade changes next run's behavior.
- **Graduated autonomy / governance tiers.** Let the system tune small things itself, escalate big ones, and keep a human-approved audit trail for anything that changes its own rules. This is how you get a system that improves without drifting.

> Sound-bite: "Most teams build the pipeline and stop. The pipeline is the easy 80%. The eval loop is the 20% that decides whether month three is better than month one."

---

## 6B. End-to-end build: one coffee shop, start to finish (8 min)

> The live payoff. We follow a single fake lead, "Lighthouse Coffee Roasters", through every stage, using the BrewOps teaching kit (`presentations/evonexus-demo/brewops/`). Same shape as the real Novara pipeline, in a domain everyone gets.

**Stage 0: definitions loaded.** Show `definitions/icp.md` (the rubric) and `buyer-roles.md` (champion vs gatekeeper). These are the injected "core memory" for this run.

**Stage 1: raw discovery** (`data/01-raw-discovery.json`). All we knew at first: a name, a city, a website, and three signals (directory listing, a "hiring a manager" job post, an Instagram post about a second location). Found by *two* workers independently, multi-source validation. `contacts: []`, everything else `null`. This is a lead.

**Stage 2: enriched + scored** (`data/02-enriched-prospect.json`). The clinic-data worker filled the facts (540 tx/day, Square-only, no ops tool). The contact worker found Dana Whitfield (Café Manager → **Champion**, verified email) and Marcus Reed (Owner → **Decision-maker**, escalation only). Inbound check: no site visit, no score boost. Code computes the score from the rubric → **96/100, High**. The model wrote a shop-specific **Angle**. It's now a prospect.

**Stage 3: human gate** (`data/03-human-gate-dashboard.md`). The pipeline presents the ranked dashboard and **stops**. The human types: *"approve 1, skip the rest, and lead the angle with the second location, not the hire."* Natural language in, structured intent out.

**Stage 4: write + learn** (`data/04-crm-record.md`). Only now does it write the record (with the human's angle edit), trace every fact to a source, then **grade itself** and ask the human for a one-line eval that gets logged for next run's Wave 0.

**The point to land:** every stage added information under a constraint, and the single irreversible action waited for a human. That's the whole pattern, visible in four files.

---

## 7. The whole thing on one slide (2 min)

| Sales concept (tactical) | System component (technical) | LLM best practice |
|---|---|---|
| Lead lifecycle / pipeline stages | State machine over a typed CRM | External memory + state machines tame non-determinism |
| The CRM | Notion DBs (state) + markdown (narrative) | Context engineering; query fresh, inject durable |
| Word definitions (lead, ICP, roles) | Small per-concept files injected on demand | Progressive disclosure; single-responsibility prompts |
| SDR research | Orchestrator + parallel discovery/enrichment workers | Supervisor–worker; context isolation |
| ICP / lead scoring | Deterministic rubric + threshold table | Put correctness in code, judgment in the model |
| The pitch / Novara Angle | Constrained generation w/ good-bad exemplars | Few-shot, grounded in retrieved facts |
| Contact data + emails | WebSearch, Hunter, PostHog, Notion via MCP+REST | Tool use; carry confidence/provenance |
| "Don't add a dupe / don't write junk" | Schema, dedup, validation, human gates | Guardrails; calibrated autonomy |
| Rep manager reviewing the list | Wave 3 blocking human approval | HITL at the irreversible step |
| Coaching the rep | Self-eval + Cron Runs + 3-tier self-tuning | Closed-loop evals; graduated governance |

**Closing line:** "The model is maybe 20% of this system. The other 80% is the boring, load-bearing engineering: the state machine, the gates, the eval loop. That ratio is the lesson. If you take one thing home: *don't build an AI that does the job, build the rails the AI runs on, and own the gates.*"

---

## 8. Appendix: likely Q&A

- **"Why not just one big prompt?"** Context bloat, hallucination, no isolation, no reusability, impossible to debug. Decompose.
- **"How do you stop hallucinated contacts?"** Quality bar: no contact is written without a verified LinkedIn or email. A name with no findable footprint is dropped.
- **"What model?"** Orchestrator on the strongest model (planning/judgment); workers can run on a cheaper/faster tier (bounded tasks). Match model tier to task difficulty.
- **"Cost?"** Parallel workers + capped at 10 prospects/run + cheaper workers. The human gate also caps waste, you don't enrich 500 junk leads.
- **"What's the hardest part?"** Not the AI. The schema discipline and the dedup logic. Get those wrong and you poison your system of record.
- **"Could this run fully autonomously?"** Technically yes through Wave 2. We *choose* to gate Wave 3 because writing to the system of record is the one step where a wrong move costs trust. Autonomy is a dial, not a switch.
- **"How is this different from Clay / Apollo / Outreach?"** Those are great at the data plumbing. The differentiator here is the *reasoning layer*, the clinic-specific Angle and the self-tuning eval loop, and full ownership of the gates.
