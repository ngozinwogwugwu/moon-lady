# Ontology Revision — CEO Decision Record
**Owner:** Ngozi — CEO
**Date:** 2026-02-21
**Status:** Issued — supersedes relevant sections of v0-product-direction.md
**Informs:** Ilya's dispersion-map.md, Amara's sample-readings.md, data posture

---

## 1. Use the Standard Tarot Deck

The 18 invented card names (The Root, The Break, The Mirror, etc.) are replaced by the cards of the standard tarot deck.

**Rationale:** The cultural language of tarot is already embedded. The images are familiar. The names carry resonance we would spend years building from scratch. We do not need to earn that resonance — we can inherit it and add our layer of polarity geometry on top of it.

Custom decks are a future feature. Users may eventually create their own card sets. For V0, we use what exists.

**What this means for Ilya:**
The dispersion map must be rebuilt using real tarot card names and imagery. The polarity coordinate assignments remain Ilya's design — the axes are right, the domain buckets are right — but the cards being mapped are now the 22 Major Arcana and 56 Minor Arcana of the standard tarot.

**Open question Ilya must answer with me:** Do we use all 78 cards in V0, or a curated subset? 78 cards is a full mapping project. A curated subset of the most culturally recognizable cards may be more appropriate for V0 scope. Ilya should propose a path and get CEO sign-off before rebuilding the dispersion map.

---

## 2. Reversed Cards Replace the Antipode Pairing System

In standard tarot, a reversed (upside-down) card represents the shadow, blocked, or opposite meaning of the upright card.

This convention replaces Ilya's antipode system. Instead of requiring every card to have a geometric opposite in the deck (which cuts the card space in half), each card is its own opposite when reversed.

**What this means structurally:**
- A card in polarity space has two positions: upright (primary pole) and reversed (opposite pole).
- The reversed position does not require a separate card in the deck — it is the same card, inverted.
- Ilya no longer needs to design cards in forced pairs. Cards can be placed more freely in polarity space.

**What this means for Amara:**
The shadow/gift two-interpretation structure remains valid. But its source changes: instead of "antipode card," the second interpretation comes from the reversed reading of the selected card. The voice should refer to upright/reversed semantics, not antipode card names.

**What this means for the geometry:**
Stage A still produces a polarity vector for the selected card. The system must now also determine: is this card upright or reversed? That determination is based on the direction of the polarity signal relative to the card's primary axis. If the transcript maps to the card's primary axis pole (upright pole), the card is upright. If the signal maps to the opposite pole but the card is still the best match, the card is reversed. The Stage A output needs a `card_orientation: "upright" | "reversed"` field.

---

## 3. MajorScore — Naming Correction

The confidence metric that Ilya defined — how well a card's polarity position corresponds to the transcript's dominant signal — is valuable and should exist. But it should not be called MajorScore.

**MajorScore**, in the CEO's reading of the system, means: how intense or major this reading is — specifically, whether it warrants Major Arcana selection. That is the Arcana Gate concept (feature vector magnitude threshold for Major Arcana eligibility).

**Rename decisions:**
- The polarity match confidence metric (previously MajorScore) → **MatchScore**
- The intensity threshold that gates Major Arcana eligibility (Ilya's Arcana Gate) → **MajorScore** or **IntensityScore** (Ilya to propose; CEO to approve)

**What MatchScore is:** Stage A's confidence that a selected card's polarity position corresponds to a dominant signal in the transcript. Three bands: Commit (≥0.65), Exploratory (0.40–0.64), Abstain (<0.40). The thresholds and behavior don't change — only the name.

**What MajorScore becomes:** The intensity measure that determines whether a Major Arcana card is eligible in this spread. The Arcana Gate logic (feature vector magnitude > 0.70 on primary axis, max one Major per spread) is the right underlying concept. Ilya should rename and clarify.

All references to "MajorScore" in existing deliverables that are about match confidence should be updated to "MatchScore."

---

## 4. Data Retention — Calibration Exception

Previous posture: "Delete until forced to keep." Raw transcripts deleted after feature extraction.

**Revised posture for V0 calibration phase:** Store transcripts — and all aspects of each reading — until calibration is sufficient to trust the system.

**Rationale:** To build a product that works, we need to evaluate whether card selections are appropriate. That evaluation requires the transcript. Without the transcript, the golden test vector set is thin and the calibration loop is slow. The tradeoff is real: users who know their transcripts are retained may be less willing to bare their souls. That is an acceptable tradeoff in V0, when the user base is friends and testers, not the public.

**Revised data retention scope for V0:**
- Transcript: retained
- Feature vector: retained
- Card selection (spread): retained
- MatchScore (formerly MajorScore) per card: retained
- Interpretation: retained
- Ontology version ID: retained
- Calibration metadata: retained

**When this reverts:** Once calibration is sufficient (MatchScore reliability diagram reaches the target ≥70% appropriate at Commit band), the posture reverts to delete-first for transcript. The archive is cleaned. The deletion-first principle is not abandoned — it is deferred during calibration.

**User-facing implications:** In V0 (friend testing), users should know their transcripts are retained for calibration. Informed consent, not buried policy. The privacy team should specify exactly how this is communicated.

---

## What Is Unchanged

- Six polarity axes (S, C, X, O, L, A): confirmed.
- Domain buckets (Foundation, Motion, Interior, Relation, Threshold): confirmed.
- Appropriateness rubric (Axis Alignment, Arcana Type Match, Spread Coherence): confirmed. Zeros on Axis Alignment should be flagged and scrutinized.
- MatchScore (renamed) three-band model and thresholds: confirmed.
- Similarity weighting table: confirmed.
- Interiority-first V0 worldview: confirmed.
- Determinism: confirmed.
- Scarcity feature flag: confirmed.
