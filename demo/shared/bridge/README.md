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
| POST | `/pbc/enroll` | Register companion/worker in truthroot |
| POST | `/pbc/init-demo` | Seed demo worker + hello job |
| POST | `/fs/*` | Read/write/list/delete files |
| POST | `/identity/get-public-key` | Derive SPKI thumbprint from PEM |
| POST | `/identity/sign-work` | Ed25519 v4 work signature |
| POST | `/identity/validate-work` | Re-verify signed work |

**Security:** binds `127.0.0.1` only. Ghost-pepper filesystem access — local demo only.

*AFT: AI-generated-user-reviewed-pending*