# Definition: Prospect

<!-- inject-when: a worker is scoring a lead, generating an angle, or preparing the human-gate dashboard -->

A **prospect** is a lead that has been **qualified**: it cleared the dedup gate, was scored against the ICP rubric, and met or exceeded the threshold worth pursuing. Promotion from lead → prospect is a *gate*, not a vibe.

## Promotion rule (lead → prospect)

```
lead  --(passes dedup AND lead_score >= 60)-->  prospect
```

- Below 60 → still a lead; presented but flagged "marginal fit," usually not enriched deeply.
- 60–79 → prospect, **Medium** priority, standard enrichment + standard angle.
- 80–100 → prospect, **High** priority, full enrichment + a high-touch, shop-specific angle.

See `icp.md` for how the score is computed.

## What a qualified prospect must carry

By the time we present a prospect to a human, it must have:

- A computed **lead score** (0–100) and a **priority** (High/Medium/Low).
- At minimum: website + location + **one real contact** (with a verified email or LinkedIn). A prospect with no reachable human is demoted to "low confidence."
- A **BrewOps Angle**: 1–2 sentences connecting *this specific shop's* situation to BrewOps' value. Not a template.
- A concrete **next step**.

## Why the system models it this way

"Prospect" is the label that says *the machine has done its qualification work and a human's attention is now worth spending.* The whole point of the discovery → score → enrich sequence is to convert cheap, abundant leads into a small, ranked set of prospects a founder can act on in minutes.

> Bridge: lead → prospect is a **deterministic gate** (dedup + threshold), not the model "feeling good" about a shop. The model gathers evidence; arithmetic decides promotion.
