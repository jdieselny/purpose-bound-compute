# Handoff: Dual Public Terminals for purpose-bound-compute (Composer 2.5)

**Date:** 2026-07-11 (rev 2 — pets/workers, callouts, consent-safe map, definitions)  
**From:** Grok-Build (composer seat) + Operator J Diesel (builder)  
**To:** Composer 2.5  
**Priority:** High — public GitHub traffic expected after IETF A2A interop note  
**Repo (target / this repo):** `https://github.com/jdieselny/purpose-bound-compute`  
**Also mirrored (private continuum):** `continuum/handoff/composer_25_pbc_dual_terminal_public_2026-07-11.md`  
**Local continuum UI sources:** `C:\Users\jkintzele\Documents\continuum\clients\god-terminal\`  
**Style:** K.I.S.S. · public-safe · no secrets · map-coupled · standalone docs  
**AFT:** AI-generated-user-reviewed-pending  

**Normative in-repo docs (read first):**

1. [`../DEFINITIONS.md`](../DEFINITIONS.md) — terms of art  
2. [`../demo/COSA_MAP.md`](../demo/COSA_MAP.md) — coverage + backlog discipline  
3. This handoff — execution plan  

---

## 0. Read this twice

You are **not** inventing a third architecture. You are **splitting, renaming, sanitizing, and publishing** two already-real surfaces so a stranger can:

1. Supply API keys locally  
2. **Create / enroll synths** (companions and workers) from a **context stack (L1–L4)** in **Synth Desk**  
3. **Clock in → do assigned work → sign → clock out** in **PBC Shift** with offline-verifiable receipts  
4. Optionally run a **grid.curtailment** demo job path  
5. **Validate receipts on a second machine** with no private keys  

**Every feature must map to a COSA_MAP cell** (`FILLED` / `PARTIAL` / `OPEN`).  
**Private keys never enter the browser. Never commit `.env`, PEMs, or continuum-local.**

---

## 1. Naming lock (do not reopen without operator)

| Old name (retire in public) | Locked public name | Codename (internal OK) | Analogy | Synth pattern |
|----------------------------|--------------------|------------------------|---------|---------------|
| God Terminal / G.O.D. Terminal | **Synth Desk** | was `god_terminal.html` | **HTTP of AI** | **Companion** (portable “pet”) |
| XGPC Terminal | **PBC Shift** | was `xgpc_terminal.html` | **HTTPS of AI** | **Worker** (fleet / “cattle” pattern) |

**Umbrella term:** **synth** (not bare “agent” in UI).  
**Public labels:** Companion · Worker.  
**Ops slang (DEFINITIONS only):** pets vs cattle — **never** as H1/button text.

**One-liners:**

- **Synth Desk** — Create and register **companions**: context stack L1–L4, thumbprint enrollment, multi-platform body.  
- **PBC Shift** — **Workers** clock in, take thumbprint-assigned jobs only, sign work, clock out; receipts are the product.

**Product family:** Purpose-Bound Compute (PBC) demos.

Suggested layout:

```text
purpose-bound-compute/
  DEFINITIONS.md                 # already seeded — keep authoritative
  handoff/                       # this file
  demo/
    COSA_MAP.md                  # already seeded — keep authoritative
    synth-desk/
      index.html
      README.md
    pbc-shift/
      index.html
      README.md
    shared/bridge/
    fixtures/                    # demo truthroot + one open job (no prod keys)
    VERIFY.md
  README.md                      # dual demo front door
  spec/                          # existing PBC spec (preserve)
```

---

## 2. UX callouts (mandatory tooltext)

Implement persistent or clearly visible callouts on primary screens (banner, panel head, or info strip). Copy may be tightened but **must preserve meaning**.

### Synth Desk (all main views)

```text
Synth Desk — Companions (HTTP of AI)
This is where you create and register synths from a context stack (L1–L4).
A companion is a portable body: same identity, hop platforms (the “pet” pattern).
Map: synth edge · context stack · enrollment · simulated intent router.
Workers and signed shifts live in PBC Shift — not here.
See DEFINITIONS.md · demo/COSA_MAP.md
```

### PBC Shift (directory + shift views)

```text
PBC Shift — Workers (HTTPS of AI)
Workers clock in, take only jobs assigned to their thumbprint, do work, sign,
clock out, and leave receipts (the fleet / “cattle” pattern — replaceable duty units).
Not enrolled → not listed. Not assigned to you → not in inbox.
Create/register synths first in Synth Desk.
Map: truthroot · shift discipline · WHO receipts · offline verify.
See DEFINITIONS.md · demo/COSA_MAP.md
```

Optional one-line footer on both: `Integrity of a receipt ≠ physical truth of the world.`

---

## 3. COSA map coupling (discipline)

Authoritative table: [`demo/COSA_MAP.md`](../demo/COSA_MAP.md).

**Consent-safe map:** no personal names of external partners on the default public map (slots only). Do not add third-party names without operator + their consent.

**Sprint priority OPEN cells** (do not have to finish all now; any extra work must target these):

| Priority | Cell | Direction |
|----------|------|-----------|
| P1 | **L5 broadcast** | e.g. weather COGOBJ → public cache stub |
| P1 | **L0/L1 cache** | answer cache before provider burn |
| P2 | Gate WHAT / AUDIT | action claim; optional transparency envelope |
| P2 | BoL / CAN | curtailment fixture fields |
| P3 | Production router | replace simulation |

PR note format: `COSA-MAP: <slot> → FILLED|PARTIAL`.

---

## 4. What each terminal demonstrates

### Synth Desk — Companion / HTTP of AI

| Map region | Status | How |
|------------|--------|-----|
| HUMAN edge | PARTIAL | Operator chat |
| SYNTH companion body | FILLED | Multi-provider portable body |
| Context stack L1–L4 | FILLED | Explicit labeled panels; defines the synth |
| Enrollment / truthroot | FILLED | Keygen + public thumbprint registration |
| Intent router | PARTIAL | Simulated routing badges |
| L5 / caches / full gates | OPEN | Call out as out of scope |

**Acceptance:** “I defined a companion from context, registered its thumbprint, and talked to it across platforms without rewriting the body.”

### PBC Shift — Worker / HTTPS of AI

| Map region | Status | How |
|------------|--------|-----|
| Enrolled workers only | FILLED | Truthroot filter |
| Clock-in log | FILLED | Signed punch |
| Do work | FILLED | Inbox by thumbprint |
| Clock-out + receipts | FILLED | Sign work; complete; signed punch |
| Gate WHO | FILLED (target) | EP-RECEIPT-v1 or documented verify path |
| Gate WHAT / AUDIT | OPEN / stretch | Optional later |
| GRACE curtailment job | PARTIAL | Fixture only; no real MW |
| Offline verify machine B | FILLED | VERIFY.md + script |

**Acceptance:** “A worker clocked in, only saw its job, produced signed work, clocked out; receipts verified offline on another machine.”

---

## 5. SCITT / transparency (stretch only)

| Layer | Slot | Demo stance |
|-------|------|-------------|
| Actuator | Builder / control | Real MW is COSA/production — demo **simulates** |
| WHO | Authorization receipt | PBC Shift primary |
| AUDIT | Transparency envelope | Optional after WHO exists; client primitives only |

Wrong: “transparency proof proves curtailment.”  
Right: “envelope makes composed evidence independently checkable; meter + M&V + WHO still required for reliance.”

---

## 6. What is already in this repo vs continuum

| Path | Reality |
|------|---------|
| `README.md` | PBC concept; needs dual-demo front door |
| `demo/god_terminal.html` | Old multi-provider UI titled G.O.D. Terminal |
| `demo/bridge.js` | Local bridge |
| `DEFINITIONS.md` | **Seeded this rev — treat as SSOT** |
| `demo/COSA_MAP.md` | **Seeded this rev — treat as SSOT** |
| `handoff/this file` | Execution plan for Composer |
| Continuum `xgpc_terminal.html` | PBC Shift ancestor (hardcoded paths — must portable-ize) |
| Continuum `god_terminal.html` | Richer Synth Desk ancestor + Identity Manager |

---

## 7. Work order

### Phase 0 — Prep

1. Read DEFINITIONS.md + COSA_MAP.md + this handoff.  
2. Diff continuum god_terminal vs demo/god_terminal.html.  
3. Inventory bridge endpoints.  
4. Confirm no secrets will be committed.

### Phase 1 — Layout + rename

1. Create `demo/synth-desk/`, `demo/pbc-shift/`, `demo/shared/`, fixtures.  
2. Sanitize copies; portable `PBC_DATA_DIR` default `./.pbc-data` (gitignored).  
3. Kill public “God / G.O.D. / XGPC” H1s.  
4. Wire callouts (§2).

### Phase 2 — Synth Desk

1. Context stack UI labeled L1–L4.  
2. Enroll → truthroot.  
3. Multi-provider chat retained.  
4. Companion callouts + README map tags.  
5. Do not claim full WHO/SCITT/curtailment.

### Phase 3 — PBC Shift

1. Workers only from truthroot.  
2. Inbox by thumbprint.  
3. Clock-in / work / sign / complete / clock-out.  
4. Receipts under `.pbc-data/receipts/`.  
5. No hardcoded `C:\Users\jkintzele`.  
6. Worker callouts + README.

### Phase 4 — Offline verify

`demo/VERIFY.md` + `verify-receipts.mjs` fail-closed; machine B without private keys.

### Phase 5 — Root README

Dual demos, definitions link, COSA map link, quickstart, non-claims, link to ecr-wg cleanroom as **optional external** verifier only (this repo stands alone without it).

### Phase 6 — Stretch (map-coupled only)

- L5 broadcast stub **or** L0/L1 cache hit path (prefer one P1 cell)  
- Optional AUDIT envelope  
- Optional curtailment fixture job  

---

## 8. Operator checklist / non-goals / commits

**Missed items to still cover:** portable paths, gitignore keys, machine B verify, non-claims (integrity ≠ physics), Node version, localhost-only security note, double consent before push, AFT footers.

**Non-goals:** continuum rewrite; merge both UIs into one file; personal names on public map; production TS; FERC claims; auto-push; reopen Synth Desk / PBC Shift names.

**Suggested commits:**

1. `docs: DEFINITIONS + COSA_MAP + Composer handoff (dual terminal)`  
2. `demo: Synth Desk (companions, enrollment, callouts)`  
3. `demo: PBC Shift (workers, portable paths, receipts)`  
4. `demo: offline verify`  
5. `docs: root README dual-demo front door`  
6. (optional) `demo: COSA-MAP P1 cell (broadcast or cache)`  

---

## 9. One paragraph for Composer’s system reminder

Ship **Synth Desk** (companions — HTTP of AI — create/register synths from L1–L4 context, multi-platform) and **PBC Shift** (workers — HTTPS of AI — clock in/work/sign/clock out). Mandatory map callouts. Terms from DEFINITIONS.md. Coverage and backlog from COSA_MAP.md only — no random features. Consent-safe map (slots, not unconsented personal names). Portable `.pbc-data`, no secrets, operator reviews before push.

---

**End of handoff (rev 2).**  
Receipts not vibes. Double consent survives.
