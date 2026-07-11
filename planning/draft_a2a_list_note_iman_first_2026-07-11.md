# Draft — to Iman first (not yet to a2a list)

**To:** Iman  
**Subject:** Quick look before A2A list? (PBC dual demos + verifiable curtailment stack)

---

Iman —

Before anything hits the Agent2Agent list, I want your eyes on it. You’re our guide for IETF navigation in every sense that matters — rooms, tone, what not to overclaim — and this would only be our second or third real exchange with that list. I’d rather send one clean note with your input than three awkward ones.

**Ask:** Does the draft below read right for the list? Anything to cut, soften, or re-home under EMILIA / Actionstate / HotRFC? Happy to take your redlines verbatim.

— Justin

---

## Proposed list post (after your OK)

**To:** [Agent2Agent list]  
**Subject:** Runnable local demos — purpose-bound compute + verifiable curtailment vertical

---

Hi all —

Sharing two public, clone-and-run pieces that may be useful as concrete companions to the agent-identity / accountability discussion. Still early days for us on this list; feedback welcome.

### 1) Purpose-Bound Compute (dual terminal demos)

https://github.com/jdieselny/purpose-bound-compute

Localhost bridge only (no cloud host required for the job path):

```text
git clone https://github.com/jdieselny/purpose-bound-compute.git
cd purpose-bound-compute
node demo/shared/bridge/bridge.js
```

- **Synth Desk** — companion body: L1–L4 context stack, thumbprint enroll to local truthroot, multi-provider chat  
- **PBC Shift** — worker body: clock in, **create job** assigned to enrolled thumbprint, signed work, clock out, offline verify  
- Weather strip + COGOBJ cache via `GET /pbc/weather` (wttr.in, local)

CLI for jobs:

```text
node demo/scripts/create-job.mjs --list-agents
node demo/scripts/create-job.mjs --assign demo-worker -i "Write a one-line status and sign it"
```

**Claims kept tight:** demo bridge is localhost / ghost-pepper; receipts prove integrity of signed work, not physical meters; production intent router still open.

### 2) ECR-WG — verifiable curtailment vertical (related)

https://github.com/jdieselny/ecr-wg

Offline Proof-of-Curtailment composition (Packing Slip + BoL → COGOBJ → EP-AEC → COSA work product → SCITT) plus independent Rust cleanroom (**163/163** on current public vectors). On-prem smoke:

```text
powershell -ExecutionPolicy Bypass -File scripts/install-onprem.ps1
# or: ./scripts/install-onprem.sh
```

Flagship map: https://github.com/jdieselny/ecr-wg/blob/main/planning/FLAGSHIP_VERIFIABLE_CURTAILMENT.md  

Coalition framing we are using among ourselves (not a standards claim): **EMILIA (WHO) + COSA/ECR (execution vertical) + Actionstate (WHAT / outcome-record leg)**. Happy to be corrected on naming or placement.

Grateful for prior guidance from Iman Schrock on the EMILIA receipt profile and list hygiene — any further steering appreciated.

Best,  
Justin Kintzele  
J Diesel NY / ECR-WG  

---

## Internal (do not send)

- Do **not** claim HotRFC slot for Justin; Steven has the short mic if any.  
- Do **not** put Steven on the power controller.  
- Session close / SESSION_CLOSE is operator culture — fine as UI flavor, not as list jargon unless Iman likes it.  
- Wait for Iman before list send.
