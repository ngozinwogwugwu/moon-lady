# Domain Bucket Definitions
**Owner:** Ilya Moreau — Symbol Architect
**Sprint:** 001 / Task I-2
**Status:** Complete
**Feeds:** dispersion-map.md (I-3)

---

## Purpose

Domain buckets are thematic clusters that organize the 18 cards into regions of human experience. They serve two functions: ensuring the card set covers the full range of what a person might bring to a reading, and preventing clustering in polarity space (cards in the same bucket should still be geometrically distinct from each other).

Buckets are not interpretive categories the user sees. They are a design and quality-control tool.

---

## Axis Reference

Six polarity axes underlie the system. All cards are positioned along these axes.

| Axis | Negative Pole | Positive Pole | Notation |
|---|---|---|---|
| 1 | Volatility | Stability | **S** |
| 2 | Rupture | Continuity | **C** |
| 3 | Contraction | Expansion | **X** |
| 4 | Self | Other | **O** |
| 5 | Obscurity | Clarity | **L** |
| 6 | Reception | Action | **A** |

Coordinates run −1.0 to +1.0 on each axis. Major Arcana occupy extreme positions (±0.80 or greater on their primary axis). Minor Arcana occupy mid-range positions (±0.30 to ±0.70 on primary axis).

---

## The Five Buckets

---

### 1. Foundation

**Theme:** What is built, held, sustained. The experience of stability, resource, continuity, and grounded capacity.

**Primary axes:** S (Stability+), C (Continuity+)
**Secondary:** L (Clarity+, moderate), A (Reception, slight)

**Design rationale:** Every reading may involve a Foundation card — what the person is standing on, whether they know it or not. These cards are never dramatic; they are what is quietly true. The bucket needs one Major at the extreme and Minors that cover different expressions of groundedness (what is maintained, what is assessed, what is rooted).

**Cards assigned:** 4 (1 Major, 3 Minor)
- The Root (Major)
- The Hold (Minor)
- The Ground (Minor)
- The Measure (Minor)

**Clustering check:** The Root is at extreme Stability+. The Hold is dominant on Continuity+. The Ground is dominant on Stability mid with inward tilt. The Measure is dominant on Clarity+ with slight stability. All four occupy different sub-regions of the Foundation space.

---

### 2. Motion

**Theme:** What moves, initiates, shifts course. The experience of action, momentum, volition, and trajectory.

**Primary axes:** A (Action+), X (Expansion+), S (Volatility−, moderate)
**Secondary:** L (Clarity+, moderate), O (Other+, slight)

**Design rationale:** Motion cards are about doing — not transformation (that's Threshold) but directed movement. The bucket needs a Major at the extreme of Action and Minors that distinguish between beginning to move, accelerating, and correcting course. These are among the most legible cards; the voice must work against literalism.

**Cards assigned:** 4 (1 Major, 3 Minor)
- The Current (Major)
- The Step (Minor)
- The Swerve (Minor)
- The Surge (Minor)

**Clustering check:** The Current is at extreme Action+. The Step is early-stage action, slight expansion. The Swerve is mid-volatility with action maintained. The Surge is high-action with strong expansion. Geometrically distinct across the S and X axes.

---

### 3. Interior

**Theme:** What is held inward. The experience of self-knowledge, witness, uncertainty, and the inner turning.

**Primary axes:** X (Contraction+), O (Self+), L (Obscurity−, moderate)
**Secondary:** A (Reception+), S (Stability, slight)

**Design rationale:** Interior is the core of the system. These cards address the relationship a person has with their own inner life — how they observe themselves, where they are unclear, when they turn. The bucket needs a Major at the extreme of inwardness and Minors that cover distinct inner experiences. Cross-session note: Amara confirmed that V0 is primarily about interiority; these cards carry the most interpretive weight.

**Cards assigned:** 4 (1 Major, 3 Minor)
- The Mirror (Major)
- The Witness (Minor)
- The Haze (Minor)
- The Turn (Minor)

**Clustering check:** The Mirror is at extreme Contraction/Self. The Witness is mid-Self with contained observation. The Haze is mid-Obscurity with inward tilt. The Turn is mid-Self with slight Rupture signal. The Witness and the Turn are in the same quadrant (Self, inward) but the Turn's Rupture signal and the Witness's Stability signal separate them meaningfully.

---

### 4. Relation

**Theme:** What connects, transmits, receives back. The experience of contact between self and other.

**Primary axes:** O (Other+), X (Expansion+)
**Secondary:** A (Action+, moderate), C (Continuity+, slight)

**Design rationale:** Relation cards address the membrane between self and world — not external events but the relational field. Smaller bucket because V0 is interiority-first; the Relation cards provide context rather than primary interpretation. Post-V0 expansion should grow this bucket first.

**Cards assigned:** 3 (1 Major, 2 Minor)
- The Weave (Major)
- The Bridge (Minor)
- The Echo (Minor)

**Clustering check:** The Weave is at extreme Other/Expansion. The Bridge is mid-Other, mid-Expansion, active. The Echo is mid-Other but slight Contraction — it receives rather than reaches. The Contraction signal distinguishes The Echo clearly from the other two.

---

### 5. Threshold

**Theme:** What cannot be held. The experience of rupture, passage, obscurity, and what lies between states.

**Primary axes:** C (Rupture−), L (Obscurity−), S (Volatility−, moderate)
**Secondary:** A (Action+, slight — thresholds require crossing)

**Design rationale:** Threshold cards are the most archetypal in the system. They sit at the extremes of Rupture and Obscurity — the two axes most associated with what cannot be controlled or known. Two Majors are appropriate here because the threshold experience is both break and veil; the Minor covers the active passage between them. These cards require the most restraint from the voice.

**Cards assigned:** 3 (2 Major, 1 Minor)
- The Break (Major)
- The Veil (Major)
- The Crossing (Minor)

**Clustering check:** The Break is extreme Rupture. The Veil is extreme Obscurity. The Crossing is mid-Rupture with Volatility — it sits between the two Majors geometrically and thematically. Distinct.

---

## Distribution Summary

| Bucket | Cards | Majors | Minors |
|---|---|---|---|
| Foundation | 4 | 1 | 3 |
| Motion | 4 | 1 | 3 |
| Interior | 4 | 1 | 3 |
| Relation | 3 | 1 | 2 |
| Threshold | 3 | 2 | 1 |
| **Total** | **18** | **6** | **12** |

---

## Notes for Dispersion Map

- Each card's primary axis assignment comes from this document. The dispersion map adds coordinates, keywords, anchors, and antipodes.
- The Relation bucket is intentionally smaller in V0. The architecture supports expansion.
- The Threshold bucket has two Majors by design — The Break and The Veil represent distinct aspects of threshold experience (the break is structural; the veil is epistemic). They should not be consolidated.
