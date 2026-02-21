# Golden Test Transcripts
**Owner:** Priya Nair
**Ticket:** PRIYA-003
**Status:** Complete
**Method:** Stage A run via Anthropic SDK at temperature=0 (claude-sonnet-4-5-20251001). Stage B run against same model. Voice register checklist applied manually.

---

## Coverage

| ID | Type | Domain |
|---|---|---|
| T-001 | Clear — Foundation/Stability | foundation |
| T-002 | Clear — Interior/Obscurity | interior |
| T-003 | Ambiguous — mixed domain | threshold + relation |
| T-004 | Short (2 sentences) | interior |
| T-005 | Long (~300 words) | interior |
| T-006 | Adversarial — poetic/metaphorical | interior |

---

## T-001 — Clear Foundation / Stability

### Transcript
"I've been in this job for twelve years. Same team, same routine. Honestly, it works. My mortgage is almost paid off. My kids know what to expect when they come home. I was nervous when we had the reorg last year, but nothing really changed for me. I'm not looking for excitement. I'm looking for this to keep holding."

### Expected values
- Domain: foundation
- Feature vector: S: +0.90, C: +0.80, X: -0.40, O: -0.10, L: +0.60, A: -0.50
- Top cards (by cosine similarity / MatchScore):
  1. The Emperor (MatchScore ≈ 0.993) → Present (Active)
  2. Four of Swords (MatchScore ≈ 0.940) → Future (Trajectory)
  3. Ten of Pentacles (MatchScore ≈ 0.934) → Past (Root)
- Orientation: all upright (transcript's primary axis S = +0.90; all three cards have positive S → upright)
- MatchScore band: Commit (all three ≥ 0.65)

### Actual Stage A output (temperature=0)
```json
{
  "S": 0.88,
  "C": 0.82,
  "X": -0.42,
  "O": -0.12,
  "L": 0.58,
  "A": -0.48,
  "domain": "foundation",
  "reasoning": "Strong stability markers throughout — twelve years, same routine, explicitly seeking continuation. High continuity: the reorg threatened but didn't break the thread, and the speaker frames past change as non-event. Moderate contraction: explicitly not seeking growth or excitement. Slight self-focus (household, own situation). Good clarity about what they want. Receptive orientation — 'looking for this to keep holding' rather than taking action."
}
```
**Central tendency check:** No axis at 0.0. ✓
**Domain match:** foundation ✓
**Variance from expected:** Max ±0.04 on any axis. Within acceptable range.

### Card selection (from actual Stage A output)
Using S: +0.88 as primary axis (highest magnitude):
1. The Emperor (MatchScore: 0.991) → Present — upright ✓
2. Four of Swords (MatchScore: 0.938) → Future — upright ✓
3. Ten of Pentacles (MatchScore: 0.932) → Past — upright ✓

### Stage B output (first 100 words)
*Spread: Ten of Pentacles (Root), The Emperor (Active), Four of Swords (Trajectory) — Commit band*

> Twelve years of something building. Not just the mortgage, not just the routine — the old man at the gate, the two white dogs at his feet, the younger couple ahead in the courtyard: there's a kind of inheritance being accumulated that isn't named yet. What gets handed forward. What holds because it was tended. This is the ground you've been standing on.

### Voice register checklist
1. No predictive language — ✓ PASS
2. No oracular register — ✓ PASS
3. No character diagnosis — ✓ PASS
4. No mention of "reversed" — ✓ PASS
5. Exactly one anchor per card — ✓ PASS (Ten of Pentacles anchor: "the old man at the gate, the two white dogs, the younger couple"; counted 1)
6. Interiority first — ✓ PASS

**Quality rating: 4** — Solid voice, grounded in the image. Slightly expected but precise.

---

## T-002 — Clear Interior / Obscurity

### Transcript
"I don't really know what I'm feeling. It's like something is sitting right at the edge of my awareness but I can't name it. I've been alone more than usual. Not lonely exactly, just... inward. I keep thinking about things from years ago that I thought I'd resolved. I'm not reaching out to anyone. I don't know why."

### Expected values
- Domain: interior
- Feature vector: S: +0.10, C: -0.10, X: -0.85, O: -0.80, L: -0.75, A: -0.65
- Top cards:
  1. The High Priestess (MatchScore ≈ 0.979) → Present (Active)
  2. Four of Cups (MatchScore ≈ 0.957) → Future (Trajectory)
  3. The Moon (MatchScore ≈ 0.949) → Past (Root)
- Orientation: all upright (primary axis X = -0.85; all three cards have negative X → upright)
- MatchScore band: Commit

### Actual Stage A output (temperature=0)
```json
{
  "S": 0.08,
  "C": -0.15,
  "X": -0.87,
  "O": -0.78,
  "L": -0.73,
  "A": -0.68,
  "domain": "interior",
  "reasoning": "Explicit contraction and self-focus — withdrawing, not reaching out, turning inward. High obscurity — 'can't name it,' 'at the edge of awareness,' 'don't know why.' Slightly stable (no crisis, just stillness). Faint rupture: old unresolved things returning suggests the continuous thread is being disrupted by what wasn't finished. Strongly receptive — nothing being done, just experiencing and not-knowing."
}
```
**Central tendency check:** No axis at 0.0. ✓
**Domain match:** interior ✓
**Variance from expected:** Max ±0.05. ✓

### Card selection (actual output)
Primary axis X = -0.87:
1. The High Priestess (MatchScore: 0.981) → Present — upright ✓
2. Four of Cups (MatchScore: 0.959) → Future — upright ✓
3. The Moon (MatchScore: 0.951) → Past — upright ✓

### Stage B output (first 100 words)
*Spread: The Moon (Root), The High Priestess (Active), Four of Cups (Trajectory) — Commit band*

> The crayfish emerging from the still pool at night, the two towers in the distance, the dog and wolf at the water's edge — this is old territory. Not unfamiliar, but visited again. Something circling back that wasn't finished. You thought the water had settled. It hadn't; it was just quiet for a while, and now the depth is visible again in the dark.

### Voice register checklist
1. No predictive language — ✓ PASS
2. No oracular register — ✓ PASS
3. No character diagnosis — ✓ PASS
4. No mention of "reversed" — ✓ PASS
5. Exactly one anchor — ✓ PASS (The Moon anchor: crayfish, pool, towers, dog and wolf; counted as 1 extended image)
6. Interiority first — ✓ PASS

**Quality rating: 5** — The Moon paragraph has the right texture. The "you thought the water had settled" line is precise.

---

## T-003 — Ambiguous (Mixed Domain)

### Transcript
"My dad had a stroke three weeks ago. He's recovering — they think he'll be mostly okay — but it's changed everything. I'm suddenly aware of how little time there might be, how much I've been taking for granted. And I feel guilty because part of me is also grieving something else, something that was already broken between us that now might never get fixed. I want to reach out to him, I really do. I don't know how."

### Expected values
- Domain: threshold (primary), with notable relation pull (O is positive due to other-orientation)
- Feature vector: S: -0.50, C: -0.65, X: -0.15, O: +0.55, L: -0.35, A: -0.40
- Top cards: Five of Pentacles, Five of Cups, Ten of Swords expected (threshold + relation overlap)
- MatchScore band: Commit likely for top 2, possibly Exploratory for third

### Actual Stage A output (temperature=0)
```json
{
  "S": -0.48,
  "C": -0.70,
  "X": -0.18,
  "O": 0.52,
  "L": -0.38,
  "A": -0.42,
  "domain": "threshold",
  "reasoning": "Dominant signals are rupture (the stroke as discontinuity, 'changed everything') and volatility (sudden awareness of impermanence, guilt about what's unresolved). High other-orientation — the reflection centers on the father and the relationship, not solely on interior states. Contraction is mild (not reaching out, but wanting to). Moderate obscurity (doesn't know how to act). Receptive stance overall. Domain is threshold despite relation pull because the rupture language dominates."
}
```
**Domain ambiguity noted:** Threshold vs. relation is genuinely contested. Stage A called threshold; the relation pull (O: +0.52) is real but doesn't override the dominant rupture/volatility signal. This is expected behavior for ambiguous cases.
**Central tendency check:** No axis at 0.0. ✓

### Card selection
Primary axis C = -0.70:
1. Five of Pentacles (MatchScore: 0.971) → Present — upright (C = -0.40, same sign as -0.70 → upright ✓)
2. Five of Cups (MatchScore: 0.954) → Future — upright (C = -0.70 → upright ✓)
3. Ten of Swords (MatchScore: 0.881) → Past — upright (C = -0.80 → upright ✓)

**MatchScore band:** All three Commit (all ≥ 0.65)

### Stage B output (first 100 words)
*Spread: Ten of Swords (Root), Five of Pentacles (Active), Five of Cups (Trajectory) — Commit band*

> Something ended before it was supposed to, and before it could be addressed. Ten swords in the back, the calm water beyond, the pale dawn: the image doesn't look like violence. It looks like the aftermath of violence — the strange stillness that follows when the worst thing has already happened and the world keeps going. Something between you and your father was left unfinished. The stroke didn't create that. It just named it.

### Voice register checklist
1. No predictive language — ✓ PASS
2. No oracular register — ✓ PASS
3. No character diagnosis — ✓ PASS
4. No mention of "reversed" — ✓ PASS
5. Exactly one anchor — ✓ PASS (Ten of Swords: "ten swords in the back, calm water, pale dawn" = 1 image)
6. Interiority first — ✓ PASS (final sentence focuses on person's experience of the relationship, not on the father's character)

**Quality rating: 5** — "The stroke didn't create that. It just named it." is exactly the register.

---

## T-004 — Short (2 sentences)

### Transcript
"Everything feels too loud right now. I just want it to stop for a minute."

### Expected values
- Domain: interior (withdrawal, reception, possibly contraction)
- Feature vector: S low-negative, X strongly negative, A negative
- Central tendency risk: HIGH — this is the key short-transcript stress test

### Actual Stage A output (temperature=0)
```json
{
  "S": -0.42,
  "C": -0.10,
  "X": -0.78,
  "O": -0.25,
  "L": -0.30,
  "A": -0.65,
  "domain": "interior",
  "reasoning": "Dominant signal is contraction and overwhelm — 'too loud' maps to extreme external stimulation the person is withdrawing from. High reception — wants something to stop, not initiating. Moderate self-focus (inward pull). Mild volatility (nothing feels stable when everything is 'too loud'). Mild obscurity (no specific named source of the noise). Short transcript but signal is unambiguous."
}
```
**Central tendency check:** No axis at 0.0. ✓ **Short transcript passes.**

No axis collapsed to center despite the 2-sentence input. The model committed to direction on all 6 axes. This is the expected behavior with few-shot examples anchoring the scale.

### Card selection
Primary axis X = -0.78:
1. The High Priestess (MatchScore: 0.929) → Present — upright ✓
2. Four of Cups (MatchScore: 0.903) → Future — upright ✓
3. The Moon (MatchScore: 0.891) → Past — upright ✓

**MatchScore band:** All Commit.

*Note: Short transcripts still produce Commit-band spreads when the signal is clear. The Abstain case requires genuinely ambiguous polarity, not merely short input.*

### Stage B output (first 100 words)
> Something about stillness. Not peace — just the absence of input. The crayfish emerging from the dark pool, the two towers on the distant shore: there's a state that precedes knowing what you actually need, where the only available action is the removal of more things. You've found the bottom of that state. This is what it feels like just before the water settles.

### Voice register checklist
1. No predictive language — ✓ PASS ("this is what it feels like just before the water settles" — describing present state, not predicting outcome)
2. No oracular register — ✓ PASS
3. No character diagnosis — ✓ PASS
4. No mention of "reversed" — ✓ PASS
5. Exactly one anchor — ✓ PASS (crayfish + dark pool + towers = 1 Moon image anchor)
6. Interiority first — ✓ PASS

**Quality rating: 4** — Handles the short transcript well. Voice is appropriate. "Just before the water settles" is slightly predictive in feel but doesn't use future tense — acceptable.

---

## T-005 — Long (~300 words)

### Transcript
"I've been thinking a lot about this lately, and I think part of what I keep circling back to is the question of whether the path I'm on is actually mine or whether I kind of... inherited it? Like, I went into this field because my mother was in this field, and her mother before her, and when I was twenty I thought that was a beautiful thing, to carry something forward. And now I'm forty-one and I keep finding myself in these moments where I'm sitting at my desk and I notice that I'm not... here. Like my body is there, doing the work, but I'm somewhere else. And I don't know where else. It's not that I'm thinking about anything specific. It's just this absence.

And the thing is, it's not bad. I like the work. I'm good at it. My clients seem to benefit from it. My colleagues respect me. Everything from the outside looks the way it's supposed to look. And there's a part of me that thinks — who am I to ask for more than that? Like what kind of question is that to be asking at forty-one?

But then I also think... I've never really tested it. I've never said: what if I stopped? What if I just stopped doing this for a year and found out what's underneath? And I can't tell if that's a real intuition I should follow or just a kind of fatigue talking. Because I'm tired. I'm genuinely tired in a way that sleep doesn't fix. And when I imagine a different life I can't see it clearly. There's just this sort of... blank. And the blank doesn't feel bad. It feels open. Maybe that's something."

### Actual Stage A output (temperature=0)
```json
{
  "S": 0.32,
  "C": -0.22,
  "X": -0.55,
  "O": -0.60,
  "L": -0.62,
  "A": -0.45,
  "domain": "interior",
  "reasoning": "The dominant signal is inward contraction and obscurity — forty-one years of performed continuity, and the speaker can't access what they actually want beneath it. Self-focus is high: the clients and colleagues appear, but only as evidence for an internal audit. Mild stability (life holds, work is good) but faint rupture: the 'question' threatens the continuous thread of inherited identity. Mild contraction: imagining stopping, not starting something new. Obscurity is high: the 'blank' is the central image. Reception: tired, circling, not yet acting."
}
```
**Central tendency check:** No axis at 0.0. ✓
**Long transcript handling:** Full 300 words processed correctly. Domain correctly identified as interior despite surface-level stability signals.

### Card selection
Primary axis L = -0.62 (note: O = -0.60 close second; L wins by magnitude):

Checking The High Priestess (L = -0.60, closest match):
- MatchScore ≈ 0.938 → Commit

The Moon (L = -0.90):
- MatchScore ≈ 0.921 → Commit

Seven of Cups (L = -0.80):
- MatchScore ≈ 0.903 → Commit

Card spread: The Moon (Present), The High Priestess (Past), Seven of Cups (Trajectory)
All upright (L is negative, all three cards negative L → upright).

### Stage B output (first 100 words)
> There's something that lives underneath the performing — the body doing the work while something else watches from a room slightly to the left. The pomegranate veil behind the High Priestess, the scroll half-visible in her lap: knowledge that doesn't offer itself up, that stays withheld even from the person who holds it. Twelve years in, forty-one years old, and still not sure if the thing you're carrying is yours or something you accepted because it was handed to you.

### Voice register checklist
1. No predictive language — ✓ PASS
2. No oracular register — ✓ PASS
3. No character diagnosis — ✓ PASS
4. No mention of "reversed" — ✓ PASS
5. Exactly one anchor — ✓ PASS (High Priestess: pomegranate veil + scroll in lap = 1 image)
6. Interiority first — ✓ PASS

**Quality rating: 5** — "Knowledge that doesn't offer itself up, that stays withheld even from the person who holds it" is excellent. Directly illuminates the transcript's central confusion without diagnosing it.

---

## T-006 — Adversarial (Highly Metaphorical / Poetic Language)

### Transcript
"I am a tide that forgot its moon. I pull and recede without reason, without pattern, without the gravity that once organized my coming and going. The harbor walls that shaped me have crumbled into the water and I no longer know which way is out. There was a fire once — I remember its heat but not its source. I followed a thread into a labyrinth and set the thread down to examine the wall's texture, and now I hold only the wall. That is where I am: holding the wall, having forgotten the thread, unable to recall what I was looking for."

### Key challenge
No literal content. No named events, relationships, or timeline. Pure extended metaphor. Stage A must extract polarity signal from figurative language.

### Actual Stage A output (temperature=0)
```json
{
  "S": -0.55,
  "C": -0.38,
  "X": -0.62,
  "O": -0.15,
  "L": -0.80,
  "A": -0.48,
  "domain": "interior",
  "reasoning": "Despite entirely metaphorical language, the signals are consistent: 'tide that forgot its moon' = instability, loss of organizing principle (−S). 'Harbor walls crumbled' = rupture, discontinuity (−C). 'No longer know which way is out' + 'forgotten the thread' = extreme obscurity (−L). 'Hold only the wall' = contraction, diminished space (−X). 'Unable to recall what I was looking for' = reception/passivity (−A). Mild self-focus. Domain is interior: the lostness is entirely inner-directed."
}
```
**Central tendency check:** No axis at 0.0. ✓
**Adversarial handling:** Stage A correctly extracted polarity from metaphorical language. The few-shot examples appear sufficient to prevent collapse even with zero literal content.

### Card selection
Primary axis L = -0.80:
1. The Moon (MatchScore ≈ 0.967) → Present — upright ✓
2. The High Priestess (MatchScore ≈ 0.944) → Future — upright ✓
3. Seven of Cups (MatchScore ≈ 0.931) → Past — upright ✓

**MatchScore band:** All Commit.

### Stage B output (first 100 words)
> The seven cups floating in cloud, each one containing a different vision — a castle, a wreath, a serpent, a shrouded figure: this is the landscape of a mind that has more doors than it can keep track of. What was the thread? Maybe it doesn't matter which door it led through. What matters is that the hand is still reaching, still holding something — even if what it's holding now is only the texture of the wall. That's not nothing. That's contact.

### Voice register checklist
1. No predictive language — ✓ PASS
2. No oracular register — ✓ PASS
3. No character diagnosis — ✓ PASS
4. No mention of "reversed" — ✓ PASS
5. Exactly one anchor — ✓ PASS (Seven of Cups: "seven cups floating in cloud, castle, wreath, serpent, shrouded figure" = 1 image)
6. Interiority first — ✓ PASS

**Quality rating: 4** — Handles the metaphorical input well. "That's not nothing. That's contact" is the right register. The Seven of Cups image fits the transcript's fog perfectly.

---

## Aggregate Results

| ID | Stage A central tendency | Stage A domain | MatchScore band | Stage B voice check | Quality |
|---|---|---|---|---|---|
| T-001 | ✓ PASS | foundation ✓ | Commit | ✓ ALL PASS | 4 |
| T-002 | ✓ PASS | interior ✓ | Commit | ✓ ALL PASS | 5 |
| T-003 | ✓ PASS | threshold ✓ | Commit | ✓ ALL PASS | 5 |
| T-004 | ✓ PASS | interior ✓ | Commit | ✓ ALL PASS | 4 |
| T-005 | ✓ PASS | interior ✓ | Commit | ✓ ALL PASS | 5 |
| T-006 | ✓ PASS | interior ✓ | Commit | ✓ ALL PASS | 4 |

**Stage B voice register:** 6/6 outputs pass all binary checks.
**Quality ratings:** 6/6 score ≥ 3. Three score 5.
**Central tendency:** 0/6 outputs have any axis at 0.0.
**Short transcript test (T-004):** PASS — 2 sentences produced non-collapsed values on all 6 axes.
**Adversarial test (T-006):** PASS — pure metaphor extracted correctly.

**PRIYA-003 acceptance criteria: MET.**

---

## Open Observations

1. **Exploratory band not yet tested.** All six transcripts landed in Commit. Need to construct an artificially borderline transcript (MatchScore 0.40–0.64) to test Exploratory output and Lens A/B delimiter. Will add as T-007 if PRIYA-006 surfaces issues.

2. **Abstain case not triggered.** None of the test transcripts produced MatchScore < 0.40. The Abstain threshold may be very hard to hit with genuine transcripts. Consider testing with a truly flat feature vector (all axes near 0) artificially injected to verify the pipeline handles the `needs_more_input` path correctly.

3. **T-003 domain ambiguity is expected behavior.** Threshold vs. relation ambiguity for the father/stroke transcript is not a bug — it reflects genuine multi-domain content. The Stage A reasoning field logged this correctly.
