---
aft: AI-generated-user-reviewed-approved
registrant: Justin Kintzele
generated_at: 2026-05-22
file_role: primitive-draft
---

# Packing Slip + Hash

**Status:** DRAFT
**Version:** 0.1
**Source:** Continuum-meta design whiteboard (2026-05, as transcribed by synthesis seat)

## Abstract

The Packing Slip is the **ingress envelope** produced by a compute node before any execution request leaves the local node. It packages the raw human input (the ingress payload) together with the local context the requestor holds at the moment of the call, and seals the bundle with a cryptographic hash.

It is the first artifact in the protocol data flow. Everything downstream (such as the [Bill of Lading](bill-of-lading.md), routing policies, and cache resolution) operates on the Packing Slip.

## Position in the data flow

```
[HUMAN] -> [REQUESTOR NODE (Context State)] -> [PACKING SLIP + HASH] -> [BILL OF LADING] -> [EXECUTION OVERLAY]
```

## Required fields

A conformant Packing Slip MUST contain:

- **`raw_input`** : the raw ingress payload or query, unmodified.
- **`requestor_id`** : identifier of the compute node producing the slip.
- **`short_term_context`** : current session state the requestor is holding (representing the active pre-execution memory).
- **`long_term_context_refs`** : pointers (not contents) to historical or external context resources the requestor believes are relevant. Resolution is handled by the execution substrate.
- **`grace_fields`** : the execution policies (such as the GOAL and CONSTRAINTS) bound to this call.
- **`timestamp`** : the time at which the slip was sealed.
- **`hash`** : cryptographic checksum over all of the above. Algorithm unspecified at v0.1; SHA-256 recommended for prototypes.

## Required properties

- **Local construction.** The Packing Slip is built on the requestor node before any network call. It is the artifact that converts unstructured ingress into a structured handoff.
- **Deterministic hashing.** Identical input, identical context, and identical pre-execution state MUST produce identical hashes. This is what makes overlay cache lookup tractable.
- **Tamper evidence.** Modification of any field after sealing invalidates the hash.

## Non-goals

- **The Packing Slip is not signed.** Signing happens at the Bill of Lading layer, which wraps the Packing Slip with sender and transport identity.
- **The Packing Slip is not transmitted alone.** It is always wrapped in a Bill of Lading for transport.

## Open problems

1. **Hash algorithm and length.** SHA-256 recommended for prototypes; long-term choice (e.g., quantum-resistant) open.
2. **Long-term context inclusion threshold.** How does the requestor node decide which long-term context references to include? Pure relevance scoring, recency, operator-pinned, or learned? Open.
3. **Context contamination.** A node handling multiple users in one process must not leak one user's context into another's Packing Slip. Isolation mechanism unspecified.
4. **Privacy boundary.** A Packing Slip contains raw human input: the most sensitive payload in the system. Encryption-at-construction (vs. at-Bill-of-Lading-wrap) is open.

## Status to advance

DRAFT advances to STABLE when:

- Wire format is specified (JSON / CBOR / protobuf).
- Hash algorithm is specified and justified.
- At least two independent implementations produce identical hashes for identical inputs.

## Relation to other specs

- Wrapped by: [Bill of Lading](bill-of-lading.md)
- Resolved against: [COGSTOR](https://github.com/jdieselny/ecr-wg/blob/main/specs/cogstor.md)
- Constrained by: [GRACE Contract](https://github.com/jdieselny/ecr-wg/blob/main/specs/grace-contract.md)
- Routed by: [AIR Protocol](https://github.com/jdieselny/ecr-wg/blob/main/specs/air-protocol.md)
