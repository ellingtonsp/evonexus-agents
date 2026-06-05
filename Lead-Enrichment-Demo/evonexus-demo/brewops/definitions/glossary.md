# Glossary: BrewOps sales + system terms

<!-- inject-when: a worker encounters an unfamiliar sales term, or for audience onboarding -->

One place for the vocabulary, so the mixed audience (sales people and engineers) shares a language.

| Term | Plain meaning | System representation |
|---|---|---|
| **Lead** | A shop that might buy | A row in `To Research` |
| **Prospect** | A lead worth pursuing | A scored lead past the 60 threshold |
| **Account** | The shop itself | The lead entity (Clinic Outreach analog) |
| **Contact** | A human at the shop | A row in the contacts store, with a role |
| **ICP** | Who we sell to | A weighted scoring rubric + threshold table |
| **Lead scoring** | "How good is this lead" as a number | Deterministic function over retrieved facts |
| **Enrichment** | Filling in missing facts | The model + tools job (Wave 2) |
| **BrewOps Angle** | The reason *this* shop should care | Constrained generation, grounded in their signals |
| **Decision-maker** | Owns budget/signature | Role label: owner/co-owner |
| **Champion** | Feels the pain, advocates | Role label: café manager, the entry point |
| **Gatekeeper** | Screens access | Role label: head barista, route around |
| **Influencer** | Shapes but doesn't own the call | Role label: bookkeeper/consultant |
| **End-user** | Uses the product daily | Role label: barista, adoption risk |
| **Warmth** | How engaged they already are (Cold/Warm/Hot) | Field, boosted by inbound signals |
| **Inbound signal** | They came to *us* first | Web visit / demo-form event → score boost |
| **Dedup** | Don't re-add what we have | Correctness gate (ID / domain / fuzzy name) |
| **Pipeline stage** | Where the deal is | The states of the state machine |
| **Cadence** | The scripted outreach sequence | Downstream; this pipeline only sets it up |
| **SDR** | Sales Development Rep (the human this automates) | The role the orchestrator emulates |
| **Discovery** | Finding new leads | Wave 1 (parallel workers) |
| **Human gate** | A required human approval | Wave 3 (blocking) |
| **Eval loop** | Grading runs to improve them | Wave 0 synthesis + Cron Runs log |
