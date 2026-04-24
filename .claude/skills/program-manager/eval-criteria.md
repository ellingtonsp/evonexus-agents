# Program Manager — Performance Review Rubric

## ROI Score (per project, 0-100)

| Dimension | Weight | Bands |
|---|---|---|
| **ROI Ratio** (Expected Payoff ÷ Remaining Cost) | 40 | ≥10× → 40 · 5–10× → 32 · 3–5× → 24 · 1.5–3× → 14 · <1.5× → 4 · ≤1× → 0 |
| **Payback Period** (months until payoff realized) | 25 | ≤6 → 25 · 7–12 → 20 · 13–18 → 14 · 19–24 → 8 · >24 → 2 |
| **Burn Rate** (monthly $) — penalty for high burn with weak ROI | 20 | ≤$10k → 20 · $10–25k → 15 · $25–50k → 8 · >$50k → 2 (+10 if ROI Ratio ≥5×) |
| **Confidence** in payoff estimate | 15 | High → 15 · Medium → 9 · Low → 3 |

**Total → Recommendation defaults** (the Portfolio Analyst can override with rationale):
- 70+ → **Continue**
- 40–69 → **Continue with watch flag** OR **Pause** (analyst judgment, must justify)
- < 40 → **Kill**
- Any score with `data_gap: true` → no recommendation; goes to "insufficient data" section.

## Run Log Schema (`.claude/skills/program-manager/runs.jsonl`)

### Phase 1 line (written end of Wave 4)
```
{
  "run_id": "<YYYY-MM-DD-HHMM>",
  "date": "<YYYY-MM-DD>",
  "projects_reviewed": int,
  "total_burn": float,
  "kills_recommended": int,
  "kills_approved": int,
  "pauses_recommended": int,
  "pauses_approved": int,
  "savings_per_month": float,
  "disposition": "approved_all|approved_partial|rejected",
  "overrides": [{"project": str, "from": str, "to": str}],
  "memo_path": str,
  "duration_sec": int
}
```

### Phase 2 line (written after feedback)
```
{"run_id": "<same>", "feedback": "useful|mixed|noisy", "feedback_notes": str}
```

## Tier 1 — Auto-Adjustments (Wave 0 reads, Manager applies silently)

| Trigger | Adjustment | Where injected |
|---|---|---|
| Founder overrode 2+ Confidence ratings in last 3 runs | Tighten Confidence bands: only "signed contract or invoice" qualifies as High | Payoff Forecaster prompt |
| Founder rejected Kill on Payback < 6 mo project last 2 runs | Reduce Payback weight by 5pts (floor 15); redistribute to Confidence | Portfolio Analyst rubric |
| Memo > 1 page in last 3 runs | Cap Continue table to top 5; rest go to "Watch list" | Manager Wave 3 |
| `data_gap: true` on same project 2 runs in a row | Surface in memo Escalations as "stale data — owner needs to update Notion row" | Manager Wave 3 |

## Tier 2 — Human Escalation (surface in memo, do not auto-fix)

| Trigger | Escalation language |
|---|---|
| 3 consecutive runs rejected entirely | "The rubric isn't matching your judgment — let's recalibrate before next run." |
| Total active burn grew >15% since last review | "Burn is up $X — net new project or scope creep on existing?" |
| Project flagged Kill 2 runs in a row but still Active | "[Project] has been Kill-recommended twice. Defer the decision or operationalize?" |
| Founder approved Kill but project still Active 2 weeks later | "Killed but still burning — confirm wind-down or revert recommendation." |

## Disposition Mapping (for log)

| Founder reply | disposition | feedback (Phase 2) |
|---|---|---|
| `approve all` | approved_all | (await Phase 2) |
| `approve except [...]` | approved_partial | (await Phase 2) |
| `edit [...] to [...]` then `approve all` | approved_partial | (await Phase 2) |
| `reject all` | rejected | (await Phase 2) |
| Phase 2 reply "useful" | — | useful |
| Phase 2 reply "mixed" | — | mixed |
| Phase 2 reply "noisy" | — | noisy |
