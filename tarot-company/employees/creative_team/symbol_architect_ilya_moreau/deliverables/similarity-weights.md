# Similarity Weighting Table
**Owner:** Ilya Moreau — Symbol Architect
**Sprint:** 001 / Task I-5
**Status:** Complete
**Feeds:** Selector spec lock

---

## Purpose

The selection pipeline ranks candidate cards using weighted cosine similarity between Stage A's feature vector (derived from the transcript) and each card's polarity coordinate vector. The weights here determine how much each axis contributes to that similarity score.

A flat weight of 1/6 per axis is wrong for this system: not all axes are equally detectable from a transcript, and not all axes are equally load-bearing for a meaningful card match. These weights encode both detectability and interpretive importance.

---

## Base Weights

Applied when no domain signal is present in the transcript (the default case).

| Axis | Code | Base weight | Rationale |
|---|---|---|---|
| Stability ↔ Volatility | S | 0.22 | Highest: stability/volatility is the most reliably detectable signal in transcripts. Language of groundedness vs disruption is common and unambiguous. |
| Contraction ↔ Expansion | X | 0.20 | High: inward/outward orientation is consistently signaled through pronouns, scope, and relational language. Core to the interiority-first design. |
| Clarity ↔ Obscurity | L | 0.18 | High: knowingness vs uncertainty is strongly signaled in transcript language ("I don't know," "I can see clearly," etc.). |
| Rupture ↔ Continuity | C | 0.16 | Medium: rupture/continuity is detectable but often implicit. "Everything changed" maps clearly; maintenance rarely announces itself. |
| Self ↔ Other | O | 0.14 | Medium: self/other signals are present but frequently ambiguous. A transcript about a relationship could score high on either pole. |
| Reception ↔ Action | A | 0.10 | Lowest: action vs reception is the hardest axis to detect reliably from transcript language alone. Acts often appear as intentions; reception often appears as description. |
| **Total** | | **1.00** | |

---

## Domain Modifiers

When Stage A detects a dominant domain signal in the transcript, base weights are adjusted. Only one domain modifier applies per reading (the dominant domain). Modifiers add to or subtract from base weights; the result is renormalized to sum to 1.00.

### Foundation domain signal detected
*Transcript signals: stability, maintenance, what is solid, resource, long-term patterns.*

| Axis | Modifier | Adjusted weight |
|---|---|---|
| S | +0.08 | 0.30 |
| C | +0.06 | 0.22 |
| X | −0.04 | 0.16 |
| L | 0.00 | 0.18 |
| O | −0.04 | 0.10 |
| A | −0.06 | 0.04 |
| **Total** | | **1.00** |

### Motion domain signal detected
*Transcript signals: starting something, momentum, direction, what is moving or changing course.*

| Axis | Modifier | Adjusted weight |
|---|---|---|
| S | −0.04 | 0.18 |
| C | −0.04 | 0.12 |
| X | +0.06 | 0.26 |
| L | +0.04 | 0.22 |
| O | 0.00 | 0.14 |
| A | +0.08 | 0.18 — renorm to 0.10 |
| **Total** | | **1.00** |

### Interior domain signal detected
*Transcript signals: self-reflection, inner experience, what the person notices about themselves, uncertainty about own state.*

| Axis | Modifier | Adjusted weight |
|---|---|---|
| S | 0.00 | 0.22 |
| C | 0.00 | 0.16 |
| X | +0.10 | 0.30 |
| L | +0.04 | 0.22 |
| O | −0.06 | 0.08 |
| A | −0.08 | 0.02 |
| **Total** | | **1.00** |

### Relation domain signal detected
*Transcript signals: other people, relationships, what someone else did or said, between-ness.*

| Axis | Modifier | Adjusted weight |
|---|---|---|
| S | −0.04 | 0.18 |
| C | 0.00 | 0.16 |
| X | +0.04 | 0.24 |
| L | −0.04 | 0.14 |
| O | +0.12 | 0.26 |
| A | −0.08 | 0.02 |
| **Total** | | **1.00** |

### Threshold domain signal detected
*Transcript signals: endings, irrevocable change, not knowing what comes next, being in between.*

| Axis | Modifier | Adjusted weight |
|---|---|---|
| S | −0.06 | 0.16 |
| C | +0.10 | 0.26 |
| X | −0.02 | 0.18 |
| L | +0.06 | 0.24 |
| O | −0.04 | 0.10 |
| A | −0.04 | 0.06 |
| **Total** | | **1.00** |

---

## Diversity Enforcement Interaction

Per the selector spec, cards with >0.85 cosine similarity to an already-selected card receive a penalty. This prevents the spread from selecting near-identical cards.

The similarity calculation for diversity enforcement uses **base weights only**, regardless of domain modifier in use. Domain modifiers affect card selection ranking, not diversity enforcement. This prevents domain modifiers from accidentally allowing near-duplicate selections in a tightly focused transcript.

---

## Major Arcana Gate

Before similarity ranking, Stage A applies an Arcana Gate:

- A Major Arcana card is eligible only if the transcript has a signal intensity above a threshold on at least one axis (proposed: feature vector magnitude > 0.70 on primary axis).
- Maximum one Major Arcana per spread.
- If no transcript signal clears the intensity threshold, only Minor Arcana are eligible.

This prevents Major Arcana from being selected for low-intensity or meandering transcripts. The Arcana Gate is applied before similarity ranking; the weighting table operates only on the eligible card pool.

---

## Determinism Constraint

**Added per CEO direction (2026-02-21).**

The entire weighting and selection pipeline must be deterministic. Same transcript → same domain detection → same weights applied → same ranked card list → same selection.

This means:
- Domain detection (how Stage A determines which modifier table to apply) must produce a consistent output for a given transcript. No stochastic classification. If Stage A uses a language model for domain detection, temperature must be 0 or output must be rule-post-processed.
- Weight application and cosine similarity computation are already deterministic (arithmetic operations). No change required here.
- Tie-breaking in ranking (when two cards have identical similarity scores) must use a deterministic rule — e.g., alphabetical by card name, or fixed card-ID ordering. Not random.
- Domain modifier renormalization is deterministic (arithmetic). No change required.

If Stage A cannot deterministically detect a domain signal, base weights apply. This is a valid and deterministic operating mode.

---

## Notes for Selector Spec Lock

- The weighting table is a V0 starting point. Weights should be revised after the first evaluation sprint based on which axis signals are most reliably extracted by Stage A.
- Domain detection logic (how Stage A determines which domain modifier to apply) is a Stage A implementation concern, not specified here. The boundary: this document specifies *what happens given a domain signal*; Stage A specifies *how the domain signal is detected*.
- If Stage A cannot detect a domain signal with sufficient confidence, base weights apply. There is no "no domain" error state — base weights are a valid operating mode.
