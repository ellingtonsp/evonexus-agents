# Definition: Ideal Customer Profile (ICP), as a scoring rubric

<!-- inject-when: a worker is scoring a lead or recomputing score after enrichment -->

The ICP is **who BrewOps sells to, expressed as math.** We do not ask the model "is this a good lead?", that is unstable and unauditable. We ask it discrete, checkable facts, then compute a score with fixed weights, then map the score to a priority with a fixed table.

## The BrewOps ICP, in one sentence

> Independent or small-group coffee shops (1–5 locations) doing enough volume to feel operational pain, still running on a basic POS, that are showing a growth or capacity signal.

## Scoring rubric (total 100)

| Dimension | Weight | How to score |
|---|---|---|
| **Volume fit** | 25 | 200–800 transactions/day = 25; 800–1500 = 15; <200 or >1500 = 5 |
| **Size fit** | 15 | 1–3 locations = 15; 4–5 = 12; 6+ (chain-like) = 5 |
| **Independence** | 15 | Independent owner = 15; small local group = 10; franchise of a national brand = 5 |
| **Growth/capacity signal** | 20 | Hiring a shift lead/manager = 20; opening a new location = 15; press/award mention = 10; listing only = 5 |
| **Geographic priority** | 10 | Home metro = 10; same state = 8; major metro elsewhere = 6; other = 4 |
| **Tech landscape** | 15 | Basic POS only, no ops tool = 15; legacy/custom spreadsheet ops = 10; already using a competitor = 5 |

**Score the facts you have. Leave unknowns at the midpoint** (e.g., tech landscape unknown → 10/15) and recompute after enrichment fills the gap.

## Threshold table (score → action)

| Score | Classification | Action |
|---|---|---|
| 80–100 | High priority | Full enrichment + shop-specific angle + founder outreach |
| 60–79 | Medium priority | Full enrichment + standard angle |
| Below 60 | Low / marginal | Present but flag as marginal fit |

## Why the system models it this way

The ICP rubric is the **single most important guardrail against the model's enthusiasm.** An LLM will happily tell you every coffee shop is a great fit. The rubric forces the qualification to be made of *facts the model had to retrieve and a sum we can audit.* If a score looks wrong, we can point at the exact dimension that's off, and that's also what the eval loop tunes over time (e.g., "we keep scoring too-big chains too high → adjust the size-fit weights").

> Bridge: ICP = **deterministic function over retrieved facts.** Evidence-gathering is the model's job; the score is code's job.
