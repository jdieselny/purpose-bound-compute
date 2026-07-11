# Purpose-Bound Compute — User Guide

**Document type:** User guide (full menu)  
**Applies to:** Synth Desk, PBC Shift, demo bridge  

Normative terms: [DEFINITIONS.md](../DEFINITIONS.md) · Map: [COSA_MAP.md](../demo/COSA_MAP.md)

---

## 1. Introduction

This guide documents every operator-facing control in the public PBC demos. It follows the network-appliance pattern: know what each button does, what it does *not* do, and what artifact it leaves behind.

---

## 2. Synth Desk — screen reference

### 2.1 Header bar

| Control | Action | Artifact / effect |
|---------|--------|-------------------|
| **BRIDGE** indicator | Polls `GET /health` | None |
| **THUMBPRINT** | Shows enrolled companion public key prefix | Reads localStorage `sd_thumbprint` |
| **HELP** | Opens `demo/synth-desk/help.html` | None |
| **ENROLL** | Opens enrollment modal | `POST /pbc/enroll` → truthroot entry + PEM on disk |
| **IDENTITY** | Hash-file / sign-work tools (legacy identity manager) | Optional `.sig.json` beside work files |
| **CLEAR CHAT** | Clears message history | localStorage `gt_messages` |
| **KEYS** | API key modal | localStorage `gt_key_*` |

### 2.2 Map callout

Persistent COSA coverage reminder. Links to PBC Shift, DEFINITIONS, COSA_MAP.

### 2.3 Routing bar

| Control | Action |
|---------|--------|
| Provider pills (CLAUDE, GPT, GEMINI, GROK) | Switch model vendor; prompts if key missing |
| Model dropdown | Select model ID for active provider |
| Task shape | Simulated routing badges (OPEN — not production router) |
| Token meter | Displays vendor-reported turn/session tokens |
| **TOOLS** | Enable native tool loop (requires bridge online) |
| Message count | Session message tally |

### 2.4 Context stack (L1–L4)

| Layer | Purpose |
|-------|---------|
| **L1 Identity** | Who is this synth? |
| **L2 Doctrine** | Behavior, refusal, tone |
| **L3 Tools** | Bridge/filesystem bounds |
| **L4 Session** | This-run scope and success condition |

Layers compose into the system prompt on every API call. Stored in `sd_l1` … `sd_l4` localStorage keys.

| Control | Action |
|---------|--------|
| Preset dropdown | None / Companion minimal / Custom |
| **CLEAR STACK** | Wipes all four layers |

### 2.5 Chat input

| Input | Action |
|-------|--------|
| Text area | Type message; Enter sends, Shift+Enter newline |
| **SEND** | Dispatch to selected provider |

**Confabulation guard:** Flags replies that claim tool use without a matching tool call in the same turn.

### 2.6 First-time setup overlay

Blocks interaction until at least one API key is saved. Links to help and quick-start.

### 2.7 API keys modal

| Provider | Key format | Console URL |
|----------|------------|-------------|
| Anthropic | `sk-ant-...` | console.anthropic.com |
| OpenAI | `sk-...` | platform.openai.com |
| Google Gemini | `AIzaSy...` | aistudio.google.com |
| xAI | `xai-...` | console.x.ai |

**SAVE** persists keys and dismisses setup overlay when any key is set.

---

## 3. PBC Shift — screen reference

### 3.1 Directory screen

| Control | Action |
|---------|--------|
| Worker tile | Open shift for enrolled worker (`synth_type` worker preferred) |
| **Init demo worker + job** | `POST /pbc/init-demo` |
| **Refresh** | Reload truthroot |

### 3.2 Shift screen

| Control | Action | Receipt |
|---------|--------|---------|
| **CLOCK IN** | Write + sign punch JSON | `timecards/<id>/<ts>_in.json` + `.sig.json` |
| Inbox job row | Select thumbprint-matched job | None |
| **Write work** | Create work product file | Per job `work_path` |
| **Sign work** | Ed25519 v4 signature | `<work>.sig.json` |
| **Complete → done/** | Sign, copy job to `done/`, remove from `open/` | Job retirement |
| **CLOCK OUT** | Write + sign punch with `jobs_completed` | `*_out.json` + `.sig.json` |
| **← WORKERS** | Return to directory | None |

Rules enforced in UI copy:
- **Not enrolled → not listed**
- **Not assigned to your thumbprint → not in inbox**

---

## 4. Demo bridge — command reference

Start:

```bash
node demo/shared/bridge/bridge.js [--port 7878] [--data-dir PATH] [--require-confirm]
```

Environment:

| Variable | Default |
|----------|---------|
| `PBC_DATA_DIR` | `./.pbc-data` |

### 4.1 HTTP routes

See [Spec sheet](spec-sheet.md) for full endpoint table.

### 4.2 Shell posture

Default **ghost-pepper**: full local filesystem + shell when enabled. Destructive patterns may prompt. **Localhost only.**

---

## 5. Offline verification CLI

```bash
node demo/verify-receipts.mjs [path-to-.pbc-data]
PBC_DATA_DIR=./export node demo/verify-receipts.mjs
```

Validates every `*.sig.json` under the tree. **Fail-closed:** non-zero exit on any failure.

---

## 6. Model catalog (Synth Desk)

Updated 2026-07-11 from vendor documentation.

### Anthropic
- `claude-opus-4-8` (default)
- `claude-sonnet-5`
- `claude-haiku-4-5`
- `claude-opus-4-7`

### OpenAI
- `gpt-5.6-sol` (default; alias `gpt-5.6`)
- `gpt-5.6-terra`
- `gpt-5.6-luna`
- `gpt-5.4`

### Google Gemini
- `gemini-3.5-flash` (default)
- `gemini-2.5-pro`
- `gemini-2.5-flash`
- `gemini-2.5-flash-lite`

### xAI
- `grok-4.5` (default)
- `grok-4.3`
- `grok-4.20-0309-reasoning`
- `grok-4.20-0309-non-reasoning`

If a model returns 404, select another from the dropdown — vendors retire IDs frequently.

---

## 7. Educational diagrams

| Document | Description |
|----------|-------------|
| [AFT truth overlay](diagrams/aft-truth-overlay.html) | Per-field truth tags on COGOBJ; rectify/propagate pattern |
| [COSA map](../demo/COSA_MAP.md) | Demo coverage and backlog discipline |

---

## 8. What this demo does not do

- Production intent routing (AIR/AGTP-class)
- L5 broadcast or multi-tier cache hits
- Real grid MW actuation or utility settlement
- Store API keys server-side
- Prove physical-world truth from receipts alone

---

## 9. Document index

| Type | File |
|------|------|
| Spec sheet | [spec-sheet.md](spec-sheet.md) |
| Quick-start | [quick-start-guide.md](quick-start-guide.md) |
| Brochure | [brochure.md](brochure.md) |
| Man page | [demo/synth-desk/help.html](../demo/synth-desk/help.html) |

*AFT: AI-generated-user-reviewed-pending*