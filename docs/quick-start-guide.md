# Purpose-Bound Compute — Quick-Start Guide

**Document type:** Quick-start  
**Time to first receipt:** ~10 minutes  

---

## What you need

1. Clone this repository  
2. **Node.js 18+** installed  
3. At least one API key: [Anthropic](https://console.anthropic.com), [OpenAI](https://platform.openai.com), [Google AI Studio](https://aistudio.google.com), or [xAI](https://console.x.ai)  
4. A modern browser  

---

## Step 1 — Start the bridge

From the repo root:

```bash
node demo/shared/bridge/bridge.js
```

You should see `PBC // DEMO BRIDGE` bound to `http://127.0.0.1:7878`.

Data directory defaults to `./.pbc-data` (created automatically).

---

## Step 2 — Synth Desk (companions)

1. Open `demo/synth-desk/index.html` in your browser.  
2. The **first-time setup** overlay appears — click **SET API KEYS** and paste at least one vendor key. Click **SAVE**, then **CONTINUE**.  
3. Expand **CONTEXT STACK (L1–L4)** and fill layers (or load the companion preset).  
4. Click **ENROLL** to register a companion thumbprint in truthroot.  
5. Pick a provider pill, enable **TOOLS** if the bridge is online, and send a message.  

**You defined a companion, enrolled it, and hopped providers with the same body.**

---

## Step 3 — PBC Shift (workers)

1. Open `demo/pbc-shift/index.html`.  
2. Click **Init demo worker + job** (first run only).  
3. Select **Demo Worker** → **CLOCK IN**.  
4. Select the inbox job → **Write work** → **Sign work** → **Complete → done/** → **CLOCK OUT**.  

**You ran a signed shift and left verifiable artifacts on disk.**

---

## Step 4 — Offline verify (machine B)

Copy `.pbc-data/` to another machine (USB, zip — export receipts only; PEMs optional for verify).

```bash
node demo/verify-receipts.mjs /path/to/.pbc-data
```

Exit code `0` means all `.sig.json` files validated fail-closed.

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Bridge OFFLINE in UI | Start `node demo/shared/bridge/bridge.js` |
| Model 404 / invalid | Open **KEYS**, pick a different model in the dropdown (IDs updated 2026-07-11) |
| No workers listed | Run **Init demo** in PBC Shift or enroll a worker in Synth Desk |
| Setup overlay won't dismiss | Save at least one API key first |

---

## Next reading

- Full UI reference: [User guide](user-guide.md)  
- Command/menu catalog: [Synth Desk help](../demo/synth-desk/help.html)  
- Architecture diagram: [AFT overlay](diagrams/aft-truth-overlay.html)  

*AFT: AI-generated-user-reviewed-pending*