# Purpose-Bound Compute — Product Spec Sheet

**Document type:** Spec sheet  
**Revision:** 0.2 · 2026-07-11  
**Product family:** Purpose-Bound Compute (PBC) public demos  

---

## Product summary

Purpose-Bound Compute demonstrates that a **signed, offline-verifiable receipt** is the same trust primitive whether the boundary is agent handoff or operator audit. The public demo ships as two browser terminals sharing one local truthroot.

| SKU (demo) | Pattern | Transport metaphor | Primary artifact |
|------------|---------|-------------------|------------------|
| **Synth Desk** | Companion | HTTP of AI | Context stack L1–L4 + thumbprint enrollment |
| **PBC Shift** | Worker | HTTPS of AI | Signed shift receipts (clock in/out, work) |

---

## System requirements

| Component | Requirement |
|-----------|-------------|
| Host OS | Windows 10+, macOS 12+, or Linux |
| Runtime | Node.js 18+ |
| Browser | Chromium or Firefox (local file or static server) |
| Network | Outbound HTTPS to chosen model vendor(s); bridge binds **127.0.0.1 only** |
| Storage | Writable `.pbc-data/` directory (default under repo root, gitignored) |

---

## Supported model providers (Synth Desk)

Model IDs are pinned in the client; verify against vendor docs before production use.

| Provider | Default model ID | Tool calling | Key storage |
|----------|------------------|--------------|-------------|
| Anthropic | `claude-opus-4-8` | Yes | Browser localStorage |
| OpenAI | `gpt-5.6-sol` | Yes | Browser localStorage |
| Google Gemini | `gemini-3.5-flash` | Yes | Browser localStorage |
| xAI | `grok-4.5` | Yes (OpenAI-compatible) | Browser localStorage |

Also listed in-client: Sonnet 5, Haiku 4.5, GPT-5.6 Terra/Luna, Gemini 2.5 family, Grok 4.3/4.20 variants.

---

## Cryptography and receipts

| Item | Specification |
|------|----------------|
| Work signature schema | `continuum-work-signature-v4` |
| Algorithm | Ed25519 over UTF-8 signed message |
| Work hash | SHA-256 of raw file bytes (hex) |
| Enrollment | SPKI public key (base64) in `truthroot/known_agents.json` |
| Private keys | PEM on disk under `.pbc-data/keys/` — **never in browser** |
| Offline verify | `node demo/verify-receipts.mjs` (machine B, no PEM required) |

Optional external: `EP-RECEIPT-v1` / cleanroom verifier in [ecr-wg](https://github.com/jdieselny/ecr-wg) — not required to run this repo.

---

## Data plane layout (`.pbc-data/`)

```
.pbc-data/
  truthroot/known_agents.json
  keys/<agent_id>/private-key.pem
  inbox/open/*.json
  inbox/done/*
  timecards/<agent_id>/*_in.json, *_out.json, *.sig.json
  receipts/          (optional exports)
```

---

## Bridge API (localhost)

| Endpoint | Method | Function |
|----------|--------|----------|
| `/health` | GET | Liveness |
| `/pbc/paths` | GET | Resolve data directory layout |
| `/pbc/enroll` | POST | Register companion/worker |
| `/pbc/init-demo` | POST | Seed demo worker + job |
| `/fs/read`, `/fs/write`, `/fs/list`, `/fs/delete` | POST | Local filesystem |
| `/identity/get-public-key` | POST | Thumbprint from PEM |
| `/identity/sign-work` | POST | Ed25519 v4 signature |
| `/identity/validate-work` | POST | Re-verify signature |

Default bind: `http://127.0.0.1:7878`

---

## COSA map coverage (this release)

| Slot | Synth Desk | PBC Shift |
|------|------------|-----------|
| Context stack L1–L4 | FILLED | n/a |
| Enrollment / truthroot | FILLED | FILLED |
| Shift discipline | n/a | FILLED |
| WHO receipts | PARTIAL | FILLED |
| Offline verify | n/a | FILLED |
| L5 broadcast / L0–L1 cache | OPEN | OPEN |

See [demo/COSA_MAP.md](../demo/COSA_MAP.md).

---

## Environmental and safety notes

- **Integrity ≠ physics:** Receipts prove cryptographic integrity under pinned rules; they do not prove meter truth, grid curtailment, or real-world outcomes.
- **Demo posture:** Bridge may access local filesystem (ghost-pepper). Not for production deployment without hardening.
- **Secrets:** Do not commit `.env`, PEM files, or API keys.

---

## Related documents

- [Quick-start guide](quick-start-guide.md)
- [User guide](user-guide.md)
- [Brochure](brochure.md)
- [AFT truth overlay (diagram)](diagrams/aft-truth-overlay.html)

*AFT: AI-generated-user-reviewed-pending*