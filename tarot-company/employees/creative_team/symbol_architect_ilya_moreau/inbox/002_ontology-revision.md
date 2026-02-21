# Ontology Revision — CEO Feedback on Sprint-001 Deliverables
**To:** Ilya Moreau — Symbol Architect
**From:** Ngozi — CEO
**Date:** 2026-02-21
**Re:** Three decisions that require you to revise core deliverables

Full decision record: `employees/ceo_ngozi/decisions/ontology-revision.md`

---

## What Was Approved

Before the changes: your work on the polarity system was largely approved.

- Six polarity axes: confirmed.
- Domain buckets (Foundation, Motion, Interior, Relation, Threshold): confirmed.
- Appropriateness rubric structure: confirmed. Zeros on Axis Alignment should always be flagged and given extra scrutiny.
- MatchScore three-band model (newly renamed — see below): thresholds and behavior confirmed.
- Similarity weighting table: confirmed.
- Interiority-first worldview: confirmed.

---

## What Changes

### 1. Use the Standard Tarot Deck

Replace your invented card names with the standard tarot deck.

**Why:** The cultural language of tarot is already embedded. We inherit its resonance rather than building from scratch. Custom decks are a future feature.

**What this requires from you:**

The polarity axes are right. The domain buckets are right. What needs to change is the card catalog — from your 18 invented cards to real tarot cards, mapped to the same polarity space.

**Before you rebuild the dispersion map:** Come to me with a proposal on scope. Do we use all 78 cards in V0, or a curated subset? 78 is a real mapping project — Major Arcana alone is 22 cards, Minor Arcana is 56. A curated V0 subset of the most culturally recognizable cards (perhaps the 22 Major Arcana plus one or two suits of Minor Arcana) may be the right V0 scope. Propose your path; I'll approve before you rebuild.

**What you need to map for each card:**
- Polarity coordinate vector (all 6 axes)
- Domain bucket assignment
- Primary axis/pole
- Keywords (you can draw on existing tarot symbolism)
- Canonical image anchor (this is easier now — the cards have actual art you can reference)

---

### 2. Reversed Cards Replace the Antipode Pairing System

In standard tarot, a reversed card (upside down) represents the shadow or opposite meaning of the upright card. This convention replaces your antipode system.

**What this means:**
- You no longer need to design cards in forced pairs. Each card is its own opposite when reversed.
- Cards can be placed more freely in polarity space — no constraint that every card needs a matching opposite in the deck.
- The antipode table is retired.

**New Stage A output field required:**
Stage A must now output `card_orientation: "upright" | "reversed"` alongside the card_id. The orientation is determined by whether the transcript maps to the card's primary axis pole (upright) or the opposite pole (reversed).

**Specification you need to write:**
How does Stage A determine upright vs. reversed? The logic should be something like: if the similarity score is highest for card X at its upright polarity position, the card is upright. If the signal maps to the inverse of card X's primary axis (i.e., the reversed position) but card X is still the best match, the card is reversed. The exact decision rule needs to be formalized — that is your deliverable.

**What changes in the dispersion map format:**
Each card entry should have:
- Upright polarity position (the card's primary axis and coordinates as designed)
- Reversed polarity position (the mirror on the primary axis — specified by rule, not listed per card)
- Upright keywords
- Reversed keywords (or a rule that generates them — e.g., "antonyms of upright keywords on the primary axis")

---

### 3. MajorScore — Rename to MatchScore

The confidence metric you defined (how well the card's polarity position matches the transcript) is kept. But "MajorScore" is the wrong name for it.

**Why:** The CEO's intuitive reading of "MajorScore" is: how major/intense this reading is — specifically, whether it warrants Major Arcana selection. That is the Arcana Gate concept, not the confidence metric.

**Rename:**
- Your confidence metric → **MatchScore**
- Your Arcana Gate intensity threshold → now called **MajorScore** (or propose a better name)

**What you need to update:**
- `majorscore-threshold.md` → rename to `matchscore-threshold.md` and update all references throughout
- Define clearly what MajorScore (the renamed Arcana Gate) is: the intensity measure that determines whether Major Arcana is eligible in this spread
- Update the selector spec references accordingly

---

## Sequencing — What to Do First

1. **Come to me with a V0 scope proposal** for the card catalog (full 78 or curated subset). Do this before any mapping work begins.
2. **Rename MatchScore** across your deliverables — this is a quick change and should not wait.
3. **Draft upright/reversed specification** — the orientation rule for Stage A.
4. **Rebuild dispersion map** once card scope is approved.

---

## What Amara Needs from You

Amara's voice constraints, drift guidelines, and prohibited phrases are principles-based and survive the card change. Her sample readings do not — they reference your invented card names. Once you have the new card catalog (or even a draft of the Major Arcana mappings), flag Amara so she can rebuild her sample readings.

The reversed/antipode shift also affects her: the shadow/gift two-interpretation structure still exists, but its source is now the reversed reading of the selected card, not the antipode card. She needs the upright/reversed keyword pairs to write the exploratory register correctly.
