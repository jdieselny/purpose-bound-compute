# Purpose-Bound Compute

**Receipts, not vibes.**

---

## The problem

Most agent demos end in chat logs. When the session closes, nobody can independently prove what was authorized, what ran, or who signed it. Auditors and the next agent are asked to trust memory.

That does not survive a trust boundary.

---

## The claim

**Purpose-Bound Compute** treats one object — a signed, offline-verifiable **receipt** — as the same primitive whether:

- the next party is another **agent** (handoff), or  
- the next party is an **auditor** (compliance).

Same shape. Same verify path. Fail-closed when proof is missing.

---

## Two demos, one architecture

Think of it like your network gear: a **management plane** and a **data plane** — but for synthetic work.

### Synth Desk — *HTTP of AI*

**Companions** are portable bodies. You define them once from a four-layer **context stack**, enroll a **thumbprint**, and hop model providers without rewriting identity.

*Create the synth. Register the key. Move the body.*

### PBC Shift — *HTTPS of AI*

**Workers** are fleet units. They clock in, take only jobs assigned to their thumbprint, sign work, clock out, and leave **receipts** on disk — verifiable on a second machine with no private keys.

*Transactional work. Paper trail. Replaceable duty.*

---

## Why operators care

| Without PBC | With PBC demo |
|-------------|---------------|
| "The agent said it did it" | Signed artifacts + offline re-verify |
| Shared mutable logs | Portable receipts across boundaries |
| Brand-name routing | **Thumbprint** routing |
| Hope | Fail-closed |

**Integrity of a receipt ≠ physical truth of the world.** Receipts pin cryptographic integrity under declared rules. Meters, curtailment, and human reliance still need their own evidence — but you stop conflating chat with proof.

---

## COSA-aligned, map-disciplined

We do not invent features off-map. Every demo slot is tagged **FILLED**, **PARTIAL**, or **OPEN** on the public [COSA map](../demo/COSA_MAP.md). Backlog work names the cell it fills.

Educational overlay: [AFT — Attested Fact Trace](diagrams/aft-truth-overlay.html) shows how truth judgments stay **per-field**, separate from **WHO** authorization.

---

## Try it in ten minutes

```bash
git clone https://github.com/jdieselny/purpose-bound-compute.git
cd purpose-bound-compute
node demo/shared/bridge/bridge.js
```

Open **Synth Desk** and **PBC Shift**. Run a shift. Copy `.pbc-data` to another machine. Verify.

[Quick-start guide](quick-start-guide.md) · [Spec sheet](spec-sheet.md)

---

## Standalone by design

This repository does not require private infrastructure or sibling repos to run. Optional: the [ecr-wg](https://github.com/jdieselny/ecr-wg) cleanroom verifier for `EP-RECEIPT-v1` conformance.

---

*Purpose-Bound Compute — public demo · v0.2 · AFT: AI-generated-user-reviewed-pending*