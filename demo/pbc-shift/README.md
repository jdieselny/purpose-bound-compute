# PBC Shift — Workers (HTTPS of AI)

**COSA-MAP:** truthroot consume · shift discipline · WHO receipts · offline verify → **FILLED**

**Workers** clock in, take only jobs assigned to their **thumbprint**, write and sign work, retire jobs, and clock out — leaving verifiable receipts.

## Quickstart

```bash
# from repo root
node demo/shared/bridge/bridge.js
```

Open `demo/pbc-shift/index.html`.

1. Click **Init demo worker + job** (first run) **or** enroll a worker in Synth Desk (`synth_type: worker`).
2. **Create job** for that worker (UI form) — or CLI:
   ```bash
   node demo/scripts/create-job.mjs --assign demo-worker -i "Write a one-line status and sign it"
   ```
3. Select a worker tile (not enrolled → not listed).
4. **Clock in** → select inbox job → **Write work** → **Sign work** → **Complete** → **Clock out**.
5. Export `.pbc-data/` and verify on another machine: [VERIFY.md](../VERIFY.md).

Weather strip at the top: local city/region, condition emoji, temp, live clock (bridge `GET /pbc/weather`). Double-click location to set city.

## Data layout

Default data directory: `./.pbc-data` (gitignored). Override with `PBC_DATA_DIR` or `node demo/shared/bridge/bridge.js --data-dir /path`.

```
.pbc-data/
  truthroot/known_agents.json
  inbox/open/*.json          # jobs (assigned_to = public_key)
  inbox/done/
  cache/weather.json         # latest weather COGOBJ
  keys/<agent_id>/private-key.pem
```

## Out of scope here

Multi-tier COGSTOR, live transparency service, real grid control.

Create companions/workers in [Synth Desk](../synth-desk/README.md) first.

*AFT: AI-generated-user-reviewed-pending*