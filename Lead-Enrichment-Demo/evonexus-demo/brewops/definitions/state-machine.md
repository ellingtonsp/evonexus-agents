# Definition: The Lead State Machine

<!-- inject-when: any worker that reads or proposes a status change, or the orchestrator deciding what actions are legal on an entity -->

The status field is **not a label, it is the gate on what the agent may do.** Each state defines which actions are legal and who/what may trigger the next transition.

## Account (shop) lifecycle

```
                  dedup + score>=60
   [discovered] ───────────────────► To Research
                                          │  enrichment complete + human approves
                                          ▼
                                      To Contact
                                          │  first outreach sent
                                          ▼
                                      Contacted
                                          │  reply / booking
                                          ▼
                                    Meeting Scheduled
                                          │
                                          ▼
                                     In Discussion ──► Demo Done ──► Pilot ──► Closed Won
                                          │                                        
                                          └────────────► Closed Lost / Gone Cold
```

## Contact (human) lifecycle

```
To Contact → Outreach Sent → Connected → In Conversation →
Meeting Scheduled → Demo Done → ( Nurturing | Gone Cold | Not Interested )
```

## The rule that matters

| State | What the automated pipeline MAY do | What it MUST NOT do |
|---|---|---|
| `To Research` | Enrich, score, generate angle | Write outreach |
| `To Contact` | Draft first-touch (downstream skill) | Skip the human approval that put it here |
| `In Discussion` / `Meeting Scheduled` | **Nothing automated** | Touch it, a live human conversation is in progress |
| `Gone Cold` | Re-evaluate for a re-engagement cadence | Treat as net-new |

**Transitions are owned, not free.** Some transitions are made by the agent (discovered → To Research, after gates). The most important one, `To Research → To Contact`, is owned by a **human at the approval gate**. Status changes that reflect real-world events (a reply, a booking) come from downstream systems, never invented by the model.

## Why the system models it this way

Without an explicit state machine, an LLM agent will cheerfully "advance" a deal or cold-email someone who's mid-negotiation, because nothing told it the boundary. The finite state set + legal-transition table is how you make a probabilistic actor safe to operate on a system of record.

> Bridge: **state machines tame non-determinism.** The model proposes a transition; the rules decide if it's legal; a human owns the irreversible ones.
