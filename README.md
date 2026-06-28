# Purpose-Bound Compute (PBC) Specification

**Status:** Draft Spec · Version 0.1
**Authors:** Justin Kintzele & Iman Schrock

Purpose-Bound Compute (PBC) is an open-standard protocol specification designed to enforce verifiable authorization and execution integrity for agentic artificial intelligence.

## Abstract
Stateless large language models (LLMs) operate as probabilistic engines. When wrapped in agentic loops, they execute actions that carry irreversible real-world impacts. PBC introduces a structured protocol layer that guarantees:
1.  **Authorization (Why):** Verification that the agentic action matches a human-signed purpose.
2.  **Routing (Where/When):** Verifiable routing across local and cloud compute backends.
3.  **Metering (Cost):** Attestable execution telemetry and resource costs.

By packaging intent and authorization into a single cryptographic receipt, PBC turns AI execution from an unverified opinion into an auditable ledger.

## Repository Structure
*   `/spec/` - Protocol specifications, schemas (Packing Slip and Bill of Lading), and canonicalization rules.
*   `/demo/` - Flagship reference integration using the J Diesel NY God Terminal and Express bridge.

## Protocol Core Primitives
*   **Packing Slip:** The contextual manifest representing intent (such as the target prompt, model, environment variables, and task constraints).
*   **Bill of Lading (BoL):** The signed envelope wrapping the Packing Slip with cryptographic attestations of human authorization (using `@emilia-protocol/attest`).

---
*AFT: AI-generated-user-reviewed-pending*
