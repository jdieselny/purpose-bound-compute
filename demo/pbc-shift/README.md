# PBC Shift — Workers (HTTPS of AI)

**COSA-MAP:** truthroot consume · shift discipline · WHO receipts · offline verify → **FILLED**

**Workers** clock in, take only jobs assigned to their **thumbprint**, write and sign work, retire jobs, and clock out — leaving verifiable receipts.

## Quickstart

```bash
# from repo root
node demo/shared/bridge/bridge.js
```

Open `demo/pbc-shift/index.html`.

1. Click **Init demo worker + job** (first run) or enroll a worker in Synth Desk with `synth_type: worker`.
2. Select a worker tile (not enrolled → not listed).
3. **Clock in** → select inbox job → **Write work** → **Sign work** → **Complete** → **Clock out**.
4. Export `.pbc-data/` and verify on another machine: [VERIFY.md](../VERIFY.md).

## Data layout

Default data directory: `./.pbc-data` (gitignored). Override with `PBC_DATA_DIR` or `node demo/shared/bridge/bridge.js --data-dir /path`.

## Out of scope here

L5 broadcast, multi-tier cache, live transparency service, real grid control.

Create companions/workers in [Synth Desk](../synth-desk/README.md) first.

*AFT: AI-generated-user-reviewed-pending*