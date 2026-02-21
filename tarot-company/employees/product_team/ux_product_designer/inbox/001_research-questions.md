# Deep Research Prompt — UX Product Designer

## Context

You are the UX Product Designer for a tarot-based reflection product. The product takes a user's spoken transcript (voice memo), runs it through a two-stage AI pipeline, and returns a three-card tarot reading with interpretation. Everything below is what has been built and decided so far.

### What the product does

1. The user submits a **voice memo**. The system transcribes it to text. (Voice memo is a hard product decision — it is the primary input method, not a text box.)
2. The transcript is processed by **Stage A** (feature extraction): an LLM extracts a polarity feature vector across six emotional axes and selects three Rider-Waite tarot cards.
3. The spread is processed by **Stage B** (interpretation generation): an LLM generates a three-card reading in a specific voice register. Stage B never sees the transcript — only the card selection.
4. The reading is returned to the user.

End-to-end latency: 4–10 seconds uncached (Stage A ~1–2s + Stage B ~3–8s). With Stage B cache hit: 1–3 seconds.

### The reading structure

Readings follow a **Past / Present / Future** structure (P/P/F). These are not literal time positions — they are narrative positions: root, active force, trajectory.

Each reading includes exactly **one specific anchor**: an image detail from the card's canonical Rider-Waite illustration, a concrete observable the user can notice, or a small practice. This is required — it prevents the reading from being generic.

### The voice register

The interpretation voice is governed by strict constraints:
- **Interiority-first:** Even cards about relationships are interpreted from the user's interior experience, not about other people
- **No predictive language:** "You will..." and "This means X will happen" are prohibited
- **No oracular register:** "The cards say...", "The universe is telling you..." — prohibited
- **No character diagnosis:** Calling the user or others controlling, avoidant, etc. — prohibited
- **No mention of "reversed":** Orientation is internal to the pipeline; it is never surfaced to the user as card orientation
- **Exactly one anchor:** Multiple anchors dilute specificity

### The confidence system

**MatchScore** is the system's internal confidence that the selected card matches the transcript.

- **Commit band (≥0.65):** The reading is offered as a single interpretation. The system is confident in the card selection.
- **Exploratory band (0.40–0.64):** The reading is offered in two voices — "this might be X, or it might be Y." The system is less certain; the reading holds two possibilities.
- **Abstain band (<0.40):** The system does not give a reading. It returns a **warm no**.

The user never sees the MatchScore number. They see the reading (Commit or Exploratory) or a warm no.

### The Arcana Gate (Major Arcana tiers)

When Major Arcana cards appear with high intensity, the spread is classified into a tier:
- **Tier 1** (1 Major at high intensity): signals a once-a-quarter life event
- **Tier 2** (2 Majors at high intensity): signals a major life chapter
- **Tier 3** (3 Majors at high intensity): signals a defining life moment

Most readings are Minor-only (no tier). Major tiers are meant to be rare and meaningful.

### Warm no types

There are three types of warm no:
1. **Scarcity warm no** (strict mode): "Today's reading is still with you. Come back tomorrow." — triggered when the user has already received a reading today
2. **Abstain warm no** (low confidence): "I don't have enough to work with." — triggered when MatchScore is below the Abstain threshold
3. **Incomplete spread** (partial pipeline failure): a graceful failure state

### Stalker card

When the same card appears in multiple readings — either within a session or across past sessions (V0, with user history) — the system uses specific language: "This card is returning. Sometimes that's just chance; sometimes it's a theme you're ready to meet again." This is not alarming; it is matter-of-fact. First recurrence and second-or-more recurrence have slightly different language.

### The 18-card deck

Six Major Arcana: The Emperor, The Tower, The High Priestess, The Chariot, The Moon, The Lovers.
Twelve Minor Arcana: Ten of Pentacles, Four of Pentacles, Ace of Swords, Ace of Wands, Knight of Wands, Three of Wands, Four of Cups, Seven of Cups, Page of Cups, Two of Cups, Six of Cups, Six of Swords.

### Prototype vs V0

Two build targets:
- **Prototype:** No authentication. No scarcity enforcement (unlimited readings). No dashboard. No calibration sprint. Minimum viable end-to-end pipeline to prove the system works with a small set of known users.
- **V0:** Authentication (Firebase or off-the-shelf). Scarcity (1 reading/day in strict mode, relaxed for friend testing). Calibration dashboard (internal). Proper onboarding. Feedback mechanism ("this doesn't feel right").

Initial users are **friends and testers** — a known, invited group. Public launch is post-V0.

### Data transparency requirement

V0 users are friends submitting emotional content. Their voice memos are transcribed and the transcripts are retained during the calibration phase (for quality evaluation). This is disclosed to users. After calibration is complete (target: ≥70% of high-confidence readings rated "appropriate" by human raters), transcripts are deleted.

### The product's design philosophy

The product is designed for **sacred minimalism** — ritual gravity without spectacle. It is not a consumer app. It is a contemplative tool. The design should:
- Never explain the geometry or the pipeline to the user
- Signal gravity through restraint, not decoration
- Not compete with the reading for attention
- Resist the urge to gamify, badge, or streak

---

## Your Research Questions

You are the UX Product Designer. You own the user journey, the interaction design, and the onboarding experience. Answer the following questions in as much concrete detail as possible.

**1. Full user journey map**

Map the complete interaction sequence from transcript submission to receiving a reading, including all edge cases. Specifically address:

- **Voice memo input:** The user speaks their transcript. What is the UI for this? How long is the expected memo? Is there a recording time limit? What happens if the recording fails? Is there a text fallback?
- **Latency (4–10 seconds):** What happens on screen while Stage A and Stage B are running? This is long enough to need intentional treatment. Research: how do contemplative/ritual digital experiences handle loading states? Does the wait become part of the ritual?
- **Warm no (scarcity):** How does "Today's reading is still with you. Come back tomorrow." appear? Same surface as the reading? A different state? What is the visual/interaction treatment?
- **Warm no (abstain):** How does "I don't have enough to work with." appear? Does the user understand what happened without being told the MatchScore? Is there any affordance to try again?
- **Exploratory band:** The reading is in two voices. What does a two-interpretation reading look like visually? Are both visible simultaneously, or is there a navigational structure?
- **Stalker card recurrence note:** Where in the reading does this appear? Is it inline, or a separate moment?
- **"Doesn't feel right" feedback:** A V0 requirement. A minimal affordance for the user to signal that the card selection doesn't resonate. What does this look like without breaking the ritual or inviting second-guessing?

**2. Major Arcana tier surface treatment**

A Tier 3 spread (3 Majors at high intensity, a defining life moment) is meant to feel different from a 0-Major Minor-only spread. The design challenge: how do you signal this difference without spectacle or inflation?

- Research: what precedents exist in contemplative or ritual digital experiences for signaling gravity? (Consider: meditation apps, journaling apps, spiritual direction tools, tarot apps, grief tools)
- What design vocabulary communicates "this is significant" without becoming theatrical?
- Should Tier designation be visible to the user at all? If not, how does the reading itself carry the weight?
- What are the risks of over-signaling (making users feel every reading is momentous) vs. under-signaling (making Tier 3 feel the same as Tier 0)?

**3. Onboarding for friend testing (Prototype and V0)**

V0 users are invited friends and testers. They need to understand:
- What the product is and isn't (reflection tool, not fortune-telling; geometry-based selection, not random)
- That their voice memos are transcribed and transcripts are retained during the calibration phase
- What a reading looks like before they submit their first transcript
- How voice memo input works

Design constraints:
- The onboarding must not break the ritual. Over-explaining the pipeline destroys the sacred minimalism.
- Informed consent for transcript retention must be honest without being alarming.
- First-time users should feel prepared, not instructed.

Research: what do the best ritual, contemplative, or privacy-forward onboarding experiences do? What is the minimum viable onboarding that sets correct expectations without patronizing the user?

**4. Scaffolding layer design**

Users receive a reading. They may not know what a tarot card is, what "Past / Present / Future" means in this context, or why this particular card was chosen. The product does not explain the geometry, but users may need some scaffold.

- What moments in the experience need scaffolding, and what form should it take?
- What information is available to scaffold (card name, card image, position label, MatchScore band)?
- What is the minimum scaffolding that helps a new user understand what they received without explaining the pipeline or breaking the ritual?
- Research: how do the best tarot apps, oracle apps, or contemplative tools scaffold a first-time user through a complex output without over-explaining?

---

## Output format

For each question, provide:
1. A concrete recommendation or design direction
2. Research findings: relevant prior art, analogous products, design patterns worth studying
3. Any unresolved tradeoffs or decisions the team must make
4. Specific things to prototype or user-test first
