# Purpose-Bound Compute — Definitions

**Status:** Normative glossary for this repository (v0.2)  
**Date:** 2026-07-11  
**Rule:** Prefer these terms in public UI, README, and demos. Do not require the ecr-wg or continuum repos to understand this document.

---

## 1. Product and protocol

| Term | Definition |
|------|------------|
| **Purpose-Bound Compute (PBC)** | The claim that a signed, offline-verifiable receipt binding intent/authorization, work performed, and evidence is the same kind of object whether the trust boundary is agent-to-agent (handoff) or operator-to-auditor (audit). |
| **Receipt** | Portable, immutable artifact (e.g. EP-RECEIPT-v1 style) that a party who does not share mutable memory can verify offline. |
| **Intent receipt** | Pre-action: what is about to be done + success condition. |
| **Result receipt** | Post-action: what happened + content digest. |
| **Handoff chain** | Ordered, linked receipts so the next party reconstructs state by verify, not by chat memory. |
| **Fail-closed** | Missing, broken, or unverifiable proof → refuse or halt; never silent accept. |
| **Thumbprint** | Public key (or deterministic digest of enrollment material) identifying a synth. Jobs are assigned to thumbprints, not to model brand names. |
| **Truth root / truthroot** | Local registry of enrolled synths (public keys + metadata). Demo default: `.pbc-data/truthroot/`. |
| **Offline verify** | Checking receipts on a machine that never held the private keys (export receipts only). |

---

## 2. Synths: companions vs workers

**Synth** is the umbrella term: a synthetic agent body with identity (thumbprint), context, and optional keys.  
Avoid bare **“agent”** in UI when possible — it collides with browser agents, real-estate agents, and every vendor’s product name.

| Pattern | Public term | Ops metaphor | Behavior | Primary UI |
|---------|-------------|--------------|----------|------------|
| Sticky portable body | **Companion** | “Pets” (ops slang) | Defined once from a context stack; hops model platforms; long-lived assistant relationship | **Synth Desk** |
| Fungible duty body | **Worker** | “Cattle” (ops slang) | Clock in → only assigned jobs → do work → sign → clock out → leave receipts; replaceable as a unit | **PBC Shift** |

**Public UI copy:** use **Companion** and **Worker**.  
**Glossary only:** pets/cattle may appear as the classic ops metaphor — do **not** put “cattle” in button labels or H1s.

| Term | Definition |
|------|------------|
| **Companion** | A synth optimized for continuous human interaction across platforms. Enrollment + context stack are the product. |
| **Worker** | A synth optimized for assigned, receipt-backed duty. Shift discipline is the product. |
| **Enrollment** | One-time (or rotated) registration of a synth’s public identity into the truthroot so others can assign work and verify signatures. |
| **Context stack (L1–L4)** | Layered material that *defines* the synth (identity, doctrine, tools, session bounds). Paste/structure in Synth Desk; not the same as chat history scrap. |
| **Clock-in / clock-out** | Signed punches that open/close a worker shift (session). |
| **Inbox job** | Work item visible only if `assigned_to` matches the worker’s thumbprint. |

---

## 3. Two demos (locked names)

| Locked name | Former name | Analogy | Fills |
|-------------|-------------|---------|--------|
| **Synth Desk** | God / G.O.D. Terminal | **HTTP of AI** | Create/register companions; multi-platform body; context stack; simulated routing |
| **PBC Shift** | XGPC Terminal | **HTTPS of AI** | Workers clock in/out; signed work; offline-verifiable receipts |

- **HTTP of AI** — portable interaction: the body moves; the platform is a hop.  
- **HTTPS of AI** — transactional work: write log → do work → write log with receipts.

---

## 4. COSA map terms (standalone)

These labels match `demo/COSA_MAP.md` in this repo. They are descriptive; they do not import another project’s governance.

| Term | Definition |
|------|------------|
| **COSA** | Cognitive Open Systems Architecture — layered model: no direct human → AI-datacenter path; cache, pack, route, authorize, then maybe burn inference. |
| **Human** | Operator or end user. |
| **Synth (edge)** | Body at the human edge that normalizes intent; does not own the datacenter. |
| **Cognitive Query** | Structured intent after sanitize/classify. |
| **L0 / L1 / L2 cache (COGSTOR)** | Local → regional/public → facility cache hierarchy for cognitive objects. |
| **L5 broadcast** | One-to-many hydration of public cache (e.g. weather, markets) so many synths reuse one computation. |
| **Packing Slip** | Identity/shipment metadata (thumbprint class). |
| **Bill of Lading (BoL)** | GRACE-style cargo list for the action (goal, routing, anchor, constraints, evidence). |
| **COGOBJ** | Atomic cognitive object (cache/authenticity unit). Not a receipt; not an action capsule. |
| **Intent router** | Chooses path/provider for a query (production: AIR/AGTP-class; demos may **simulate**). |
| **Gate waist** | Fail-closed composition before irreversible burn: **CAN / WHO / WHAT / AUDIT**. |
| **CAN** | Control / allowance / policy envelope for the action. |
| **WHO** | Named approver bound to exact action (authorization receipt). |
| **WHAT** | Action capsule / execution claim (what was attempted or done). |
| **AUDIT** | Optional transparency envelope (e.g. signed statement + inclusion receipt) so third parties check a log without running your machine. |
| **GRACE** | Conditional / governed action framing (goal, routing, anchor, constraints, evidence) used in curtailment and related demos. |

### Coverage tags (for callouts and backlog)

| Tag | Meaning |
|-----|---------|
| **FILLED** | This demo implements enough to teach the slot. |
| **PARTIAL** | Stub, simulation, or single happy path only. |
| **OPEN** | Not implemented; backlog must map to this slot. |
| **EXTERNAL** | Implemented in another public project; link only. |

---

## 5. Security and honesty phrases (use in UI)

| Phrase | When |
|--------|------|
| **Private keys never enter the browser** | Any sign/enroll surface |
| **Local demo bridge only** | Localhost Express/bridge |
| **Integrity ≠ physics** | Any Merkle/SCITT/receipt education callout |
| **Capability ≠ event proof** | Flex passport / enrollment vs shift receipts |
| **Not enrolled → not listed** | PBC Shift agent directory |
| **Not assigned to your thumbprint → not in inbox** | PBC Shift inbox |

---

## 6. Coalition roles (consent-safe)

In **public** docs and maps, name **slots**, not people, unless written consent is on file for that surface.

| Slot | Concern |
|------|---------|
| **Builder / actuator** | Vertical, demo, COSA control plane (moves work / MW in real systems) |
| **WHO / authorization** | Named-human authorization receipts, refuse, non-replay |
| **WHAT / action capsule** | Execution claim composition |
| **AUDIT / transparency** | Signed statement + inclusion receipts (client primitives vs operated log) |
| **Utility / reliance** | Tariff, baseline, meter authority, capacity credit |
| **Router / transport** | Intent path, anycast, envelopes |
| **Identity & time** | Enrollment, timing anchors |

Partner given names belong in private continuum notes or consented publications only — **not** in the default public COSA map in this repo.

---

## 7. Deprecated public terms

| Avoid in public UI | Use instead |
|--------------------|-------------|
| God Terminal, G.O.D. Terminal | Synth Desk |
| XGPC Terminal (as H1) | PBC Shift |
| Cattle (as label) | Worker / fleet worker |
| Pets (as label) | Companion |
| Agent (alone, ambiguous) | Synth, companion, or worker |
| “Math abolishes trust” | Independently sourced, reproducible evidence under pinned rules |

---

*AFT: AI-generated-user-reviewed-pending*
