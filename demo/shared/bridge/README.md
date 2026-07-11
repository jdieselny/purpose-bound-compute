# PBC demo bridge

Localhost-only Express-style HTTP bridge for Synth Desk and PBC Shift.

```bash
node demo/shared/bridge/bridge.js
node demo/shared/bridge/bridge.js --port 7878 --data-dir ./.pbc-data
PBC_DATA_DIR=./.pbc-data node demo/shared/bridge/bridge.js
```

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/health` | Bridge status |
| GET | `/pbc/paths` | Resolve `.pbc-data` layout |
| GET | `/pbc/agents` | List enrolled synths (no private key paths) |
| GET | `/pbc/jobs?status=open\|done` | List inbox jobs |
| POST | `/pbc/jobs` | Create job assigned to enrolled agent thumbprint |
| GET | `/pbc/weather?location=&force=` | Local weather broadcast → COGOBJ cache (wttr.in) |
| POST | `/pbc/enroll` | Register companion/worker in truthroot |
| POST | `/pbc/init-demo` | Seed demo worker + hello job |
| POST | `/fs/*` | Read/write/list/delete files |
| POST | `/identity/get-public-key` | Derive SPKI thumbprint from PEM |
| POST | `/identity/sign-work` | Ed25519 v4 work signature |
| POST | `/identity/validate-work` | Re-verify signed work |

### Create a job (public path)

```bash
# CLI
node demo/scripts/create-job.mjs --list-agents
node demo/scripts/create-job.mjs --assign demo-worker -i "Write a one-line status and sign it"

# HTTP
curl -s -X POST http://127.0.0.1:7878/pbc/jobs \
  -H "Content-Type: application/json" \
  -d "{\"assign_to\":\"demo-worker\",\"instruction\":\"Write hello and sign it.\"}"
```

Job JSON lands in `.pbc-data/inbox/open/<job_id>.json` with `assigned_to` = worker **public_key**.

### Weather / location strip

```bash
curl -s "http://127.0.0.1:7878/pbc/weather"
curl -s "http://127.0.0.1:7878/pbc/weather?location=Ithaca,NY&force=1"
```

Caches under `.pbc-data/cache/weather-*.json` and writes a COGOBJ to `.pbc-data/cache/weather.json` (15 min TTL). UI strip on Synth Desk + PBC Shift (dbl-click location to set city).

**Security:** binds `127.0.0.1` only. Ghost-pepper filesystem access — local demo only.

*AFT: AI-generated-user-reviewed-pending*