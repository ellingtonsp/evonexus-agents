# Definition: Lead

<!-- inject-when: any worker doing discovery, dedup, or deciding whether an entity belongs in the pipeline -->

A **lead** is any coffee shop that *might* become a BrewOps customer but that we have **not yet qualified**. It is the raw input to the pipeline.

A lead is the minimum viable entity: at discovery time it may be nothing more than a **name + a city**, possibly a website. That is enough to enter the system in the `To Research` state. Everything else is filled in by enrichment.

## What makes something a lead (entry criteria)

- It is a coffee shop (not a roaster-only wholesaler, not a chain HQ, not a restaurant that happens to serve coffee).
- It is **not already in our CRM** (the dedup gate decides this, see `state-machine.md`).
- It is plausibly inside our serviceable market (US, independent or small-group).

## What a lead is NOT

- A lead is **not** a prospect. A prospect is a lead that has **passed the scoring gate** (see `prospect.md`). Don't call something a prospect until it has a lead score and cleared the ICP threshold.
- A lead is **not** a contact. The lead is the *account* (the shop). The humans inside it are *contacts*, with their own roles (see `buyer-roles.md`).

## Why the system models it this way

The lead is the **unit that flows through the state machine.** Keeping the entry bar low (name + city) means discovery can be aggressive and cheap; the *quality* filtering happens at the scoring gate, not at the door. Separating "lead" (account) from "contact" (human) keeps the data model clean: one shop, many humans, distinct lifecycles.

> Bridge: a lead is a **row in an external store in the `To Research` state**, not a paragraph the model is holding in its head.
