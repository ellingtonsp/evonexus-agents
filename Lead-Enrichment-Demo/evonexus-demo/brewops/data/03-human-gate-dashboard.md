# Wave 3: Human Gate (BLOCKING)

> This is what the pipeline presents and then **stops.** Nothing is written to the CRM until the human responds. The interface is a conversation, not a form.

```
=== BREWOPS LEAD ACQUISITION REPORT ===
Run date: 2026-06-04
Sources scanned: independent-cafe directory, Indeed job board, Instagram signals
Eval adjustments applied: REGION_FOCUS (Pacific NW underrepresented last 3 runs)

DISCOVERY SUMMARY
  Raw leads found: 14 (directory: 9, signals: 4, intel: 1)
  After dedup: 6 new, 2 possible matches, 6 already in CRM
  Enrichment completed: 6 prospects

---

POSSIBLE CRM MATCHES (review first)

  1. [Discovered: "Beacon Coffee PDX"] ~ [CRM: "Beacon Coffee Co."], 78% name match
     Same shop, or different? [Same / Different]

---

NEW PROSPECTS (ranked by lead score)

  1. [SCORE: 96] Lighthouse Coffee Roasters, Portland, OR
     Size: 1 location (2nd opening fall) | ~540 tx/day | Independent
     Signal: Hiring a Café Manager (Indeed, 4d) + 2nd location announced
     POS: Square basic, no ops tool | Phone: (503) 555-0142
     Contacts:
       - Dana Whitfield: Café Manager (CHAMPION) | dana@lighthouseroasters.example (Verified) | LinkedIn
       - Marcus Reed: Owner (DECISION-MAKER) | LinkedIn only
     BrewOps Angle: "Single-location independent at ~540 tx/day, hiring a manager while
       opening a 2nd store: the moment scheduling-by-spreadsheet breaks. BrewOps gives
       Dana one schedule + inventory view across both stores before the 2nd store
       compounds the chaos."
     Next Step: "Connect with Dana on LinkedIn re: scheduling across two locations"
     CRM fields: Status=To Research, Source=Directory+Signal, Priority=High

  2. [SCORE: 71] Tidewater Espresso, Tacoma, WA
     ... (abbreviated for the demo)

---

YOUR CALL
  - "approve all"               create all as proposed
  - "approve 1,3"               approve specific prospects
  - "skip 2"                    exclude one
  - "edit 1: angle should mention their cold-brew wholesale line"
  - "not new: match 1 is the same shop"
  - any context or correction
```

## What the human typed

> **"approve 1, skip the rest for now, and 1's angle should call out that the 2nd location is the real trigger, not the hire."**

The orchestrator parses this: create only Lighthouse, tweak its angle to lead with the second-location trigger, leave the others untouched. **Then and only then** does Wave 4 write. This is the pen on the irreversible step.
