# Offline receipt verification (machine B)

Verify signed shift artifacts **without private keys**. Fail-closed: any broken signature exits non-zero.

## What this checks

- `continuum-work-signature-v4` artifacts (`*.sig.json`)
- Work file SHA-256 still matches `work_hash`
- Ed25519 signature over the v4 `signed_message`

This validates **integrity of receipts**, not physical grid curtailment or meter truth.

## Prerequisites

- Node.js 18+
- A copy of `.pbc-data/` from machine A (export receipts only — no `private-key.pem` required)

## Steps

1. On machine A, complete a shift in [PBC Shift](pbc-shift/index.html) (clock in → work → sign → complete → clock out).
2. Copy the entire `.pbc-data/` directory to machine B (USB, zip, etc.).
3. On machine B:

```bash
cd purpose-bound-compute
node demo/verify-receipts.mjs /path/to/exported/.pbc-data
```

Or:

```bash
PBC_DATA_DIR=./export/.pbc-data node demo/verify-receipts.mjs
```

## Expected output

```
OK   timecards/demo-worker/2026-07-11T...._in.json.sig.json
OK   inbox/done/hello-demo-worker.txt.sig.json
OK   timecards/demo-worker/2026-07-11T...._out.json.sig.json

Summary: 3/3 signatures valid
```

## Optional: independent EP-RECEIPT verifier

For `EP-RECEIPT-v1` documents (JCS/Ed25519), see the optional external cleanroom verifier in [ecr-wg](https://github.com/jdieselny/ecr-wg). This demo uses the operational v4 work-signature plane; EP wrap is a future map cell.

*AFT: AI-generated-user-reviewed-pending*