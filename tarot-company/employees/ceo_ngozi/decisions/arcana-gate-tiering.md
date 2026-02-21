# Arcana Gate Tiering — CEO Decision Record
**Owner:** Ngozi — CEO
**Date:** 2026-02-21
**Status:** Issued — updates similarity-weights.md and infrastructure-risk-memo.md
**Informs:** Ilya (MajorScore spec), Daniel (session contract), ML Product Lead

---

## Decision

The Arcana Gate is not a binary on/off. There are three tiers of Major Arcana weight in a spread, each exponentially harder to reach than the last. The number of Major Arcana cards in a reading signals the magnitude of what the person is in.

---

## The Three Tiers

### Tier 1 — One Major Arcana
**Life scale:** Something that happens maybe once a quarter. A significant trip. A meaningful fight. A decision that shifted things. Real, but not defining.

**Examples:** A difficult conversation that changed a relationship. A project that ended. A moment of clarity that cost something. A period of sustained anxiety that broke.

**MajorScore threshold (proposed prior):** ≥ 0.70 on primary axis. Achievable for transcripts with a clear, sustained dominant signal.

---

### Tier 2 — Two Major Arcana
**Life scale:** A significant chapter event. The kind of thing you'd remember for years. A job ending. Moving cities. A relationship of a year or more ending. Something that reorganizes your sense of what your life is.

**Examples:** Leaving a company you built something at. A breakup from a serious relationship. A major health event. Finishing something you spent a year on.

**MajorScore threshold (proposed prior):** ≥ 0.83 on primary axis, for each qualifying Major. Two cards must independently clear this threshold — it is not enough for one to be very high and the other to barely pass.

---

### Tier 3 — Three Major Arcana
**Life scale:** Defining life event. When you die, you will look back on this and know it was one of the moments. Birth. Death. Marriage. A major breakup. An immigration. A spiritual crisis or conversion. The events that divide a life into before and after.

**MajorScore threshold (proposed prior):** ≥ 0.92 on primary axis, for all three cards. Rare by design. The vast majority of users will never receive a three-Major spread. This is intentional.

---

## The Exponential Structure

| Majors in spread | Threshold per card | Relative frequency |
|---|---|---|
| 0 | — | Very common (baseline) |
| 1 | ≥ 0.70 | Uncommon — maybe once every few months for a given user |
| 2 | ≥ 0.83 | Rare — a significant life chapter event |
| 3 | ≥ 0.92 | Very rare — a defining life moment |

The thresholds are priors. They must be calibrated against the golden test vector set once labeled readings are available. The calibration question: at each tier threshold, what fraction of spreads do human raters assess as genuinely corresponding to that life scale?

---

## Arcana Gate Implementation Note

Stage A applies the Arcana Gate per card:

1. Compute the intensity score for each candidate card on its primary axis (this is the MajorScore per card).
2. A card is eligible as Major Arcana only if its intensity score clears the relevant tier threshold.
3. The number of Majors in the final spread = the number of selected cards that are Major Arcana cards AND cleared the threshold.

**The tier that applies is determined by the lowest qualifying threshold across all selected cards.** If two cards clear 0.83 but the third only clears 0.70, the spread is a 1-Major spread (only the cards that clear the highest shared threshold form a tier).

Simpler restatement: the spread's Major count is the largest N such that at least N selected cards are Major Arcana and all of those N cards cleared the Tier N threshold.

---

## What Changes

**For Ilya:** The MajorScore concept (now correctly named — the intensity gate for Arcana selection) has three tiers with separate thresholds. The similarity-weights.md Arcana Gate section needs to be updated with the tiered model. The dispersion-map.md notes section should reference the three-tier model.

**For the ML Product Lead:** The golden test vector set should include labels for which tier each spread falls in. Calibration should produce reliability curves per tier, not just per-card.

**For Stage A implementation:** The feature vector magnitude calculation needs to produce a per-card intensity score (the MajorScore), not just a binary eligible/ineligible flag.

**For the UX Product Designer:** A 3-Major spread may warrant a different surface treatment than a 1-Major spread. This is a research question — the architecture does not assume it.

---

## What Does Not Change

- The card catalog (18 Rider-Waite cards, 6 Major Arcana) is unchanged.
- MatchScore (the polarity match confidence metric, Commit/Exploratory/Abstain) is unchanged.
- The maximum number of Major Arcana per spread is 3 (one per spread position). This was already the case.
- The scarcity, deletion posture, and determinism requirements are unchanged.
