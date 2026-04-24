# EvoNexus Agents

A repository of Claude Code "departments" — skills + subagents that turn plain-English business workflows into production-shaped orchestrations.

Each department lives under `.claude/skills/<name>/` (the playbook) plus one or more files under `.claude/agents/` (the employees). They're invoked from Claude Code as slash commands (e.g. `/program-manager`).

## What's here

| Department | What it does |
|---|---|
| `orchestration-builder` | Meta-skill — interviews you and scaffolds a new department. |
| `program-manager` | Weekly ROI-only portfolio review. Emits a one-page memo with Continue/Pause/Kill calls gated on founder approval. |

## Using the orchestration builder

The orchestration-builder is the "hiring manager" for new departments. You describe a workflow in plain English; it interviews you across six phases (charter → org chart → subscriptions → memory/state → performance review → deliverables) and writes the skill, subagents, eval rubric, and README to disk.

### Run it

In Claude Code, from this repo:

```
/orchestration-builder <short name of the workflow>
```

Examples:

```
/orchestration-builder outbound SDR
/orchestration-builder weekly financial close
/orchestration-builder customer onboarding
```

Omit the argument to be asked for one.

### What you'll be asked

1. **Charter** — what problem, for whom, what shows up on the CEO's desk, how often, and what's explicitly out of scope.
2. **Org chart** — which specialists the department needs (Scout, Enricher, Qualifier, etc.) and which model tier (Opus for reasoning, Sonnet for legwork).
3. **Subscriptions** — which tools/MCP servers/APIs each specialist can touch (Notion, Google Drive, Hunter, Linear, Slack, etc.).
4. **Memory & state** — the onboarding binder (what the team needs to know about your business) and the kanban board (where status lives).
5. **Performance review** — the scoring rubric and what triggers a Tier-1 silent auto-adjust vs a Tier-2 human escalation.
6. **Deliverables** — exact format, destination, and status transition on write.

You answer in plain English. The builder holds the metaphor (employees, subscriptions, filing cabinet, kanban, executive sign-off) throughout.

### What you get on disk

```
.claude/skills/<name>/
  SKILL.md            # the department manager's SOP
  eval-criteria.md    # the weekly performance review rubric
  README.md           # plain-English charter for non-coding stakeholders
  <knowledge>.md      # onboarding binder scaffold (TODOs for you to fill)
.claude/agents/
  <name>-<role>.md    # one per specialist — their job description
```

Plus: any state machines requested (e.g. a Notion database) get created during the interview via MCP, and their IDs are baked into the skill's `State Locations` section.

### After the build

1. Fill in the `TODO` sections in the onboarding binder file. The department manager reads this on every run — empty TODOs produce generic output.
2. Invoke the new department: `/<name>`.
3. The first run is baseline: it writes a `runs.jsonl` entry under `.claude/skills/<name>/` that future runs compare against for self-tuning.
4. The manager will hit a **blocking human gate** before committing any external writes (Notion/Linear/Drive/email). Approve, edit, or reject at that point.

## Design principles (shared across all departments here)

Every department built with this framework follows the **Novara wave pattern**:

- **Wave 0** — read the last N run logs to calibrate this run.
- **Wave 1** — parallel discovery/enrichment specialists (cheap, fast, Sonnet).
- **Wave 2** — serial qualification/synthesis (Opus, reasoning).
- **Wave 3** — blocking human gate. No external side-effects until approved.
- **Wave 4** — commit deliverables + two-phase JSONL run log (phase 1 at write, phase 2 after feedback).

This keeps costs low on legwork, puts the reasoning budget where it matters, and makes every run self-auditing.

## Repository layout

```
.claude/
  skills/         # one directory per department
  agents/         # flat — one .md per specialist, prefixed by department name
  settings.json   # shared Claude Code settings (committed)
  # settings.local.json, logs/, cache/, .*-sync.json are gitignored
```

## Contributing a new department

Don't hand-write a department. Run `/orchestration-builder` and let the interview produce it. Hand-edits are fine after the initial scaffold, but the interview captures context (why each choice was made, what was scoped out) that's hard to reconstruct later.
