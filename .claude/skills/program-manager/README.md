# Program Manager

## What this department does
Every week, this department reviews every in-flight project, scores each one purely on financial ROI, and hands you a one-page memo that tells you which to continue, pause, or kill — with the dollar impact of each cut. After you approve, it updates the Notion portfolio so the recommendation is on record.

## Who's on the team
- **Cost Auditor** — pulls the actual run-rate cost per project (monthly burn, sunk cost, remaining cost-to-complete).
- **Payoff Forecaster** — estimates the financial return per project, where the number comes from, and how confident we should be.
- **Portfolio Analyst** — scores every project on the rubric, ranks them, and flags cut candidates.
- **Manager** — reviews the team's work, writes the memo, and asks you to sign off before anything is recorded.

## What it needs access to
- Notion (read + write to the `Program Portfolio` database in EvoNexus)
- Local file write (memos folder + run log)

## What you get at the end of a run
1. A one-page markdown memo at `.claude/skills/program-manager/memos/YYYY-MM-DD.md` — recommended cuts on top, continue list below, watch list, escalations.
2. After your approval: every active project's Notion row updated with a fresh ROI Score and Recommendation.
3. A line in the run log so next week's review can learn from this one.

## How to run it
```
/program-manager
```

## How it gets better over time
The manager keeps a run log. Every week before drafting, it scans the last 10 weeks for patterns — places where you overrode the team's call, projects where the data keeps coming back stale, weeks where burn jumped without explanation. Tier-1 patterns get auto-corrected silently (e.g., tightening what counts as "High confidence" if you keep downgrading it). Tier-2 patterns get surfaced in the memo as escalations.

After every run, the manager also asks you a one-word feedback question (`useful` / `mixed` / `noisy`) and logs it. Over weeks, that signal trains the rubric without you having to write a spec.

## What this department does NOT do
- Headcount or layoff decisions.
- Strategic, brand, or morale considerations — pure financial only.
- Status changes in Notion (Active → Killed). It only writes the recommendation; you operationalize the kill.
- Communication with project owners. That's your call to make.

## Where the data lives
- Portfolio: [Program Portfolio](https://www.notion.so/74ea897bc6ec4dbc98cdba18b41fa925) (under EvoNexus)
- Memos: `.claude/skills/program-manager/memos/`
- Run log: `.claude/skills/program-manager/runs.jsonl`
- Rubric: `.claude/skills/program-manager/eval-criteria.md`
