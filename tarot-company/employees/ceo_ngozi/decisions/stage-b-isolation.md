# Stage B Transcript Isolation — CEO Decision Record
**Owner:** Ngozi — CEO
**Date:** 2026-02-21
**Status:** Issued — updates session contract in infrastructure-risk-memo.md
**Informs:** Daniel (session contract), Ilya (Stage A output spec), Amara (voice constraint)

---

## Decision

Stage B — the interpretation engine — receives the spread only. It does not receive the transcript, the feature vector, or any other artifact from Stage A beyond the card selection itself.

---

## What Stage B Receives

```json
{
  "spread_shape": "coherent | tensioned",
  "cards": [
    {
      "position": "past | present | future",
      "card_id": "string",
      "card_name": "string",
      "card_orientation": "upright | reversed",
      "matchscore_band": "commit | exploratory | abstain"
    }
  ],
  "scarcity_mode": "strict | relaxed",
  "ontology_version_id": "string"
}
```

**Not included:**
- Raw transcript
- Normalized transcript
- Transcript hash
- Feature vector (the 6-axis coordinates)
- Domain detected
- Per-card MajorScore
- Per-card margin score
- Second-best card

---

## Why

**Privacy:** The interpretation engine never touches the user's words. Whatever the transcript contains — emotional disclosures, personal details, difficult experiences — it stays in Stage A. Stage B knows only what the geometry selected.

**Architectural clarity:** Stage A and Stage B are genuinely separate systems. Stage B can be developed, tested, and cached independently. Its behavior does not depend on the transcript in any way.

**Caching:** Stage B's outputs are cacheable by spread alone. If Stage B received the transcript, caching would require transcript-level keys — and the same card would produce different readings for different users. Transcript isolation makes caching correct and clean.

**Voice design:** Amara's voice spec does not reference the transcript. The reading is about the cards, not about what the user said. The card selection is the geometry's judgment about what the transcript signals — Stage B interprets that judgment, not the transcript itself.

---

## What This Means for the Voice

Amara's voice spec is already consistent with this constraint. The interpretation anchors to:
- The card's canonical image anchor
- The card's primary axis and orientation (upright or reversed)
- The spread shape (coherent or tensioned)
- The MatchScore band (Commit: standard register; Exploratory: two-interpretation structure)

None of these require the transcript. The reading feels personal because the geometry did the personalization work in Stage A. Stage B's job is to translate the geometry into language — not to respond to the user's words directly.

---

## What This Does NOT Mean

This does not mean Stage B produces a generic reading. The card selection is already specific — it reflects what the transcript signaled. A reading of The Tower in the Present position for a Commit-band, Tensioned spread is different from The Tower in the Past position for an Exploratory-band, Coherent spread. The specificity comes from the geometry, not from paraphrasing the transcript.

This also does not preclude future designs where Stage B receives a summary or abstracted version of the transcript (not the raw text). If calibration shows that Stage B quality would benefit from a transcript summary, that is a post-V0 architectural decision. For V0, Stage B receives the spread only.
