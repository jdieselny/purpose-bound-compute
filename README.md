# Purpose-Bound Compute (PBC)

**Status:** Draft spec + public dual-terminal demos  
**Normative glossary:** [DEFINITIONS.md](DEFINITIONS.md)  
**Architecture map:** [demo/COSA_MAP.md](demo/COSA_MAP.md)

> The receipt is how a stateless future trusts a stateful past — whether that future is the next agent or the auditor.

## Dual demos (start here)

| Demo | Pattern | Analogy | What you learn |
|------|---------|---------|----------------|
| [**Synth Desk**](demo/synth-desk/) | **Companion** | HTTP of AI | Define a synth from L1–L4 context, enroll thumbprint, hop providers |
| [**PBC Shift**](demo/pbc-shift/) | **Worker** | HTTPS of AI | Clock in, thumbprint-routed jobs, signed work, clock out, offline verify |

### Quickstart

Requires **Node.js 18+**. Synth Desk chat needs local API keys; **job create + weather need only the bridge**.

```bash
git clone https://github.com/jdieselny/purpose-bound-compute.git
cd purpose-bound-compute
node demo/shared/bridge/bridge.js
```

- **Synth Desk:** open `demo/synth-desk/index.html` — enroll companions/workers, weather strip, multi-provider chat  
- **PBC Shift:** open `demo/pbc-shift/index.html` — **Init demo** *or* **Create job** for any enrolled worker, then clock in / sign / clock out  
- **CLI jobs:**

```bash
node demo/scripts/create-job.mjs --list-agents
node demo/scripts/create-job.mjs --assign demo-worker -i "Write a one-line status and sign it"
```

Both UIs show **local weather + city/region + live clock** via `GET /pbc/weather` (wttr.in → COGOBJ under `.pbc-data/cache/`). Double-click the location label to set city.

Data lands in `./.pbc-data/` (gitignored). Copy it to a second machine and run [offline verification](demo/VERIFY.md) — no private keys required on machine B.

## Core claim

A signed, offline-verifiable receipt binding `{intent/authorization, work performed, evidence}` is the **same primitive** whether the trust boundary is agent handoff or operator audit. See the spec sections below for boundaries A and B.

## What we do not claim

- Receipt integrity ≠ physical curtailment or meter honesty
- Demo bridge is **localhost-only** — not production security
- Simulated routing badges ≠ production intent router (OPEN on COSA map)

## Documentation

| Type | Link |
|------|------|
| Brochure | [docs/brochure.md](docs/brochure.md) |
| Spec sheet | [docs/spec-sheet.md](docs/spec-sheet.md) |
| Quick-start | [docs/quick-start-guide.md](docs/quick-start-guide.md) |
| User guide | [docs/user-guide.md](docs/user-guide.md) |
| Synth Desk help | [demo/synth-desk/help.html](demo/synth-desk/help.html) |
| AFT diagram | [docs/diagrams/aft-truth-overlay.html](docs/diagrams/aft-truth-overlay.html) |

## Optional external verifier

[ecr-wg](https://github.com/jdieselny/ecr-wg) hosts an independent cleanroom Rust verifier (**163/163** conformance vectors) for `EP-RECEIPT-v1`. This repo stands alone without it; the demos use the operational v4 work-signature plane.

## Spec lane

- [spec/](spec/) — packing slip, bill of lading, and related PBC artifacts
- [handoff/](handoff/) — Composer execution plans (operator-reviewed before push)

---

## Boundary A: Agent context-handoff

- **Intent receipt** — pre-action claim + success condition
- **Result receipt** — post-action digest
- **Handoff chain** — ordered linkage; next party verifies, not remembers
- **Fail-closed** — broken chain halts execution

## Boundary B: Distributed-trace audit

Physical sync (PTP/GPS) + logical sync (HLC) + cryptographic audit (`EP-TIME-ATTESTATION-v1` class).

## Shipped vs building

**Shipped (EP lane):** `EP-RECEIPT-v1`, JCS/Ed25519 verifiers, conformance vectors  
**Building (PBC lane):** handoff wrapper, trace adapter, public demos (this repo)

*AFT: AI-generated-user-reviewed-pending*