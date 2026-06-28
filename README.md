# Purpose-Bound Compute (PBC) Specification

**Status:** Draft Spec · Version 0.1
**Authors:** Justin Kintzele & Iman Schrock

> The receipt is how a stateless future trusts a stateful past, whether that future is the next agent or the auditor.

## The Core Concept: One Primitive, Two Trust Boundaries

The core claim of the Purpose-Bound Compute (PBC) protocol is that a signed, offline-verifiable receipt binding `{intent/authorization, the work that ran, evidence}` is the same object whether the two parties who do not share state are:
*   **Boundary A:** Two agents across a context-window boundary (handoff).
*   **Boundary B:** An operator and an auditor across an administrative boundary (audit).

Neither receiver can trust the sender's mutable memory or logs. Both must verify state from a portable, immutable artifact.

---

### Boundary A: Agent Context-Handoff (Pre-Token-Wall Protocol)
In this boundary, execution state is preserved across agent boundaries (such as a model swap, a token reset, or a cold boot):
*   **Intent Receipt:** Captures what the agent is about to do plus the target success condition (pre-action).
*   **Result Receipt:** Captures what happened plus a content digest (post-action).
*   **Handoff:** The ordered, linked hash chain. The next agent reconstructs the execution state by verifying the chain, rather than relying on recency-biased chat memory.
*   **Fail-Closed Behavior:** If the chain is broken, the next agent detects exactly what was left unfinished and halts execution.
*   **EP Mapping:** Implemented via `EP-RECEIPT-v1` (JCS/Ed25519), ordered-chain linking (`prev_context_hash`), and the offline verifier running as the boot check.

---

### Boundary B: Distributed-Trace Audit (COSA L2/L3)
In this boundary, execution trace events are audited across distributed systems without conflating layers:
1.  **Physical Synchronization:** Precision Time Protocol (PTP) and GPS physical synchronization shrink clock skew (though clock skew is never zero).
2.  **Logical Synchronization:** Hybrid Logical Clocks (HLC) establish a causal order robust to residual physical clock skew.
3.  **Audit Layer (EP):** Hash-chaining trace events via `EP-TIME-ATTESTATION-v1`. Causal order is proven via cryptographic linkage rather than wall-clock times, enabling offline auditability without strict clock synchronization. PTP serves where wire or billing timing is required.

---

### Why It Is One Primitive
The trust-boundary requirements are isomorphic:
*   "The next agent does not trust memory."
*   "The auditor does not trust operator logs."
*   "The relying party does not operate the runtime."

In all three cases, the receipt functions as the portable proof that safely crosses the boundary.

---

## Technical Benchmarks (COSA-Side)
PBC measures execution efficiency using precise metrics rather than qualitative statements:
*   **Clock Skew:** p50, p99, and maximum skew across nodes.
*   **Out-of-Order Rates:** Out-of-order span rate measured before and after HLC integration.
*   **Attestation Overhead:** Latency (ms) and size overhead (bytes per receipt).
*   **Six-Sigma Boundary:** Bounds physical skew to keep out-of-order events below the defined target threshold.

---

## Status and Roadmaps

### Already Shipped (EP Lane)
*   `EP-RECEIPT-v1` (JCS/Ed25519 signed receipt format).
*   JCS/Ed25519 offline verifier (functionally identical across JS, Python, and Go implementations).
*   Ordered-chain specification.
*   `EP-TIME-ATTESTATION-v1` schema.
*   Conformance test vectors.

### New to Build (PBC Lane)
*   **Handoff-Receipt Wrapper:** The `intent()` and `result()` interfaces plus the `boot-verify` step.
*   **Trace-Event Adapter:** Bridges system traces to the cryptographic receipt schema.
*   **"Laptop-on-fire" Demo:** Reference demonstration showing a cold boot from Git, memory injection, verification of the receipt chain, and execution resumption.

---
*AFT: AI-generated-user-reviewed-pending*
