# COSA map — where the PBC demos sit

**Audience:** Anyone cloning this repo (no other repo required).  
**Normative terms:** [`../DEFINITIONS.md`](../DEFINITIONS.md)  
**Visual twin (optional):** if present in continuum privately; this markdown is the public SSOT.

**Consent rule:** This public map names **architecture slots only**. It does **not** attribute layers to external individuals or organizations unless a separate consented credit file is added later.

---

## One-sentence thesis

**There is no direct path from a human to an AI datacenter.**  
A synth normalizes intent; the stack caches, packs, routes, and authorizes; only then may inference burn. Results return as cognitive objects through a cache hierarchy.

---

## Forward path (request)

```text
 HUMAN          SYNTH              STACK (waist)                         AI DATACENTER
  |              |                      |                                      |
  |  intent      |  Cognitive Query     |                                      |
  +------------->|  sanitize/classify   |                                      |
  |              +-----> L0 local cache |                                      |
  |              |         | hit -----> +---- return (no DC) ------------------>| (never)
  |              |         | miss                                              |
  |              |         v                                                   |
  |              |  Packing Slip (thumbprint)                                  |
  |              |  + Bill of Lading (action cargo)                            |
  |              |         |                                                   |
  |              |         v                                                   |
  |              |  L1 region / public cache  <--- L5 broadcast (weather…)     |
  |              |         | hit --> return                                    |
  |              |         | miss                                              |
  |              |         v                                                   |
  |              |  Intent router (path / provider)                            |
  |              |         |                                                   |
  |              |         v                                                   |
  |              |  ┌─────────────────────────────────────────┐                |
  |              |  │ GATE WAIST (fail-closed)                │                |
  |              |  │  CAN   · control / policy envelope      │                |
  |              |  │  WHO   · authorization receipt          │── authorize ─> |
  |              |  │  WHAT  · action / execution claim       │                |
  |              |  │  AUDIT · transparency envelope (opt.)   │                |
  |              |  └─────────────────────────────────────────┘                |
  |              |         | gate open                                         |
  |              |         +---------------------- inference burn ----------->|
```

---

## Reverse path (response)

```text
 AI DATACENTER → COGOBJ out → L2 facility cache → L1 pub/reg → L0 local
      → SYNTH expands against local substrate → HUMAN (+ optional receipt status)
```

---

## Coverage: Synth Desk vs PBC Shift

| Map slot | Synth Desk (Companion / HTTP of AI) | PBC Shift (Worker / HTTPS of AI) | Tag |
|----------|-------------------------------------|----------------------------------|-----|
| Human intent entry | Operator chat / paste | Operator runs shift | PARTIAL |
| Synth body | **Companion** multi-platform body | Uses enrolled **worker** body | FILLED |
| Context stack L1–L4 (define synth) | **Primary** — create & register | Consumes enrollment only | FILLED / n/a |
| Enrollment / truthroot thumbprint | **Create & register** | **Not enrolled → not listed** | FILLED |
| Multi-platform hop | **Primary** | Out of scope | FILLED / OPEN |
| Intent router (production wire) | Simulated badges only | — | PARTIAL / OPEN |
| L0 local cache | — | — | OPEN |
| L1 public/regional cache | — | — | OPEN |
| **L5 broadcast** (e.g. weather) | Future companion hydration | Future job context | **OPEN (priority backlog)** |
| Packing Slip / thumbprint on work | Light (identity card) | Job assignment by thumbprint | PARTIAL / FILLED |
| Bill of Lading / GRACE cargo | — | Curtailment fixture (optional) | OPEN / PARTIAL |
| Gate CAN | — | Policy stub on demo jobs | OPEN / PARTIAL |
| Gate WHO (authz receipt) | Light (signed identity) | **Primary** intent/result receipts | PARTIAL / FILLED |
| Gate WHAT (action claim) | — | Stub / future | OPEN |
| Gate AUDIT (transparency envelope) | — | Optional stretch (client only) | OPEN / PARTIAL |
| Timecard shift discipline | — | **Primary** clock in/work/out | FILLED |
| Offline verify (machine B) | — | **Primary** | FILLED |
| Physical actuation (real MW) | — | Simulated only | OPEN (real systems external) |
| Utility meter / M&V / settlement | — | — | OPEN |

---

## UI callout requirements (Composer must implement)

Every primary screen shows a short, dismissible or persistent **map callout** (tooltext):

### Synth Desk

> **Synth Desk — Companions (HTTP of AI)**  
> This is where you **create and register synths** from a **context stack (L1–L4)**.  
> A **companion** is a portable body: same identity, hop platforms.  
> Map slots: *synth edge · context stack · enrollment · simulated router*.  
> Not in scope here: worker shifts, full WHO gate, caches, broadcast.

### PBC Shift

> **PBC Shift — Workers (HTTPS of AI)**  
> **Workers** clock in, take only jobs assigned to their **thumbprint**, do work, sign, clock out, and leave **receipts**.  
> Fleet pattern: replaceable duty units — not a chat pet.  
> Map slots: *truthroot consume · shift discipline · WHO receipts · offline verify*.  
> Create companions/workers in **Synth Desk** first.  
> Not in scope here: L5 broadcast, multi-tier cache, live transparency service, real grid control.

Use exact product names; optional footer link: `COSA_MAP.md` + `DEFINITIONS.md`.

---

## Backlog tightly coupled to OPEN slots

Do **not** invent random features. Next work must name a map cell:

| Priority | OPEN / PARTIAL cell | Candidate work |
|----------|---------------------|----------------|
| P1 | L5 broadcast | Weather (or markets) COGOBJ fan-in to public cache stub |
| P1 | L0/L1 cache | Answer cache hit path before provider burn |
| P2 | Gate WHAT | Action-claim object on completed jobs |
| P2 | Gate AUDIT | Optional signed-statement + demo inclusion receipt |
| P2 | BoL / CAN | Curtailment demo job with envelope fields |
| P3 | Production intent router | Replace badge simulation with real routing inputs |
| P3 | Meter / M&V | Explicitly out of demo until utility partner path exists |

Every PR description should include: `COSA-MAP: <slot> → FILLED|PARTIAL`.

---

## Slot legend (no personal attribution)

| Slot | Concern |
|------|---------|
| Builder / actuator | Control plane that actually performs work or shed |
| WHO | Authorization receipt bound to exact action |
| WHAT | Execution / action claim |
| AUDIT | Third-party-checkable log envelope |
| Utility reliance | Tariff, baseline, meter authority |
| Router / transport | Path selection on the wire |
| Identity & time | Enrollment and timing anchors |

---

## Design invariants (say out loud)

1. No direct human → AI datacenter path.  
2. Cache hit beats inference.  
3. Gate is fail-closed.  
4. Composition by shared digest, not one mega-format.  
5. COGOBJ ≠ action capsule ≠ authorization receipt.  
6. Integrity of a log ≠ physical truth of curtailment or meter honesty.

---

*AFT: AI-generated-user-reviewed-pending*
