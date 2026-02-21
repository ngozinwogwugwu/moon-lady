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

Six Major Arcana: The Emperor, The Tower, The High Priestess, The Chariot, The Moon, The Lovers. Twelve Minor Arcana: Ten of Pentacles, Four of Pentacles, Ace of Swords, Ace of Wands, Knight of Wands, Three of Wands, Four of Cups, Seven of Cups, Page of Cups, Two of Cups, Six of Cups, Six of Swords.

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

5. Full user journey map

1) Recommendation / design direction Primary flow (happy path) A) Home (single action). One primary CTA: “Record today’s memo.” Secondary: “How it works” (one paragraph; no pipeline). B) Recording screen (full-screen, distraction-minimal). Large record button; waveform; elapsed time; “Finish” appears after 8–10 seconds to prevent accidental taps. Suggested prompt line: “Speak what’s present. 1–3 minutes is enough.” C) Review screen. Playback, “Re-record”, “Submit”. No editing. Show what will be stored: “Audio → transcript (kept during calibration).” (Short, calm.) D) Processing ritual (4–10s). Replace “loading” with “Listening / Selecting / Writing” as three discreet steps; show one slow, breathing-like progress ring (not a spinner). Provide a single sentence that legitimizes waiting: “Give it a few breaths.” (No spectacle.) E) Reading screen. Three-card layout with Past / Present / Future labels (as narrative positions). Each card shows image + name; interpretation below in one continuous column. Exactly one anchor is visually marked with a subtle “Anchor” label or glyph so the user can find it quickly. F) Post-reading actions (quiet). Two small actions: “Save” (default) and “Reflect” (opens a single journaling prompt, optional). Minimal “Doesn’t feel right” affordance at the bottom.

Edge cases Voice memo input • Expected length: “1–3 minutes” is the default guidance; allow longer, but cap at 5 minutes for V0 to control latency/cost and reduce rambling. • Recording limit: 5:00 hard stop with soft warning at 4:30 (“30 seconds left”). • Recording fails (permission, interruption, OS error): show one-screen recovery with concrete next step: “Microphone access is off” → deep link to system settings; or “Recording interrupted” → “Try again.” • No text fallback (hard decision): keep it true for users. Internally, add a hidden dev/tester override (“Paste transcript”) behind a long-press or debug menu for calibration workflows only (not user-facing).

Latency treatment (4–10 seconds) Make the wait part of the ritual by (a) showing continuous system status, and (b) occupying time with a single calm focus rather than entertainment. Use three step labels that map to the product mental model without mentioning “Stage A/B”: “Listening” → “Choosing cards” → “Writing.” This aligns with standard guidance to provide feedback/progress during waits and reduce uncertainty. ([Nielsen Norman Group][1]) If you can detect cache hit, skip directly from “Choosing cards” to “Writing” with a subtle speed-up (do not mention cache).

Warm no (scarcity) Surface as a first-class “Reading state,” not an error modal. Use the same reading surface (same typography and layout), but replace cards with a single centered card back image or neutral placeholder and the copy: “Today’s reading is still with you. Come back tomorrow.” Provide one action: “Review today’s reading.” This avoids “blocked” feelings while preserving strictness.

Warm no (abstain) Also a first-class state. Copy: “I don’t have enough to work with yet.” Then one concrete suggestion that respects voice-first: “Try again with 45–90 seconds about what feels most active right now.” Provide CTA: “Record again.” Do not mention scores. This keeps the user oriented without exposing internals.

Exploratory band (two voices) Keep the card spread identical; only the interpretation branches. Present as a single reading with a forked section: • “Two plausible readings” header (small, understated). • Two tabs: “Lens A” and “Lens B” (or “Reading 1 / Reading 2”). Default to Lens A; show Lens B as a deliberate choice to prevent overload. • The anchor must remain the same anchor across both lenses (otherwise you violate the “exactly one anchor” rule). The anchor marker stays in the same place in both tabs.

Stalker card recurrence note Place inline, immediately under the card name the first time that returning card appears on-screen (e.g., under Present). Keep it one sentence, matter-of-fact, then continue. Do not make it a separate interruption screen.

“Doesn’t feel right” feedback (V0) Bottom of the reading, visually de-emphasized: “Doesn’t feel right?” Tapping opens a small sheet with two options: • Quick tap reasons: “Cards don’t match,” “Interpretation missed,” “Too vague,” “Other.” • Optional single-line text input (max 140 chars). Then a confirmation that preserves ritual: “Received. Today’s reading stays as-is.” (Avoid training users to brute-force new readings.)

2. Major Arcana tier surface treatment

1) Recommendation / design direction Do not show Tier numbers. Signal gravity through restraint, not labels: • Slightly more negative space around the spread. • A single, quiet preface line above the interpretation for Tier 3 only: “This spread carries unusual weight. Read slowly.” • Slow the transition into the reading by ~300–500ms and keep the processing ritual’s “Writing” step visible a beat longer (perceived intentionality, not slowness). • Avoid additional ornament, color changes, badges, or “special effects.” The cards are already the event.

2) Research findings / prior art to study Mindfulness app design discussions emphasize calm status communication (animations that regulate rather than excite) and minimizing anxiety during waits. ([Prototypr][2]) Research on “mindfulness apps in the app store” critiques common gamification patterns (streaks/badges) as potentially misaligned with contemplative practice—useful validation for your “sacred minimalism” constraint. ([Sean Munson][3]) For “gravity without spectacle,” study grief-support products’ tone: they tend to use plain language, spacious layouts, and gentle pacing rather than celebratory UI. (Untangle is a useful reference class for voice and restraint, even if the feature set differs.) ([Untangle Grief][4]) For tarot-specific minimalism, Golden Thread Tarot and similar products show that reduced visual clutter can amplify meaning, which aligns with your goal of letting the reading dominate attention. ([Golden Thread Tarot][5])

3) Unresolved tradeoffs / decisions • Should the Tier 3 preface line exist at all? Benefit: sets pacing and seriousness. Risk: could prime users toward grandiosity. • If you never surface Tier explicitly, how do you ensure users notice rarity? You may accept that “noticed by feeling” is sufficient; the reading text itself may carry it. • If you do surface it, any explicit tiering risks creating a status economy (“chasing Tier 3”) and undermines your anti-gamification stance.

4) Prototype / user-test first • A/B: Tier 3 with no preface vs. one-line preface + extra whitespace. Measure: perceived significance, anxiety, and “felt theatrical” ratings. • Pacing: test the slightly slower transition into Tier 3 reading. Ensure it reads as intention, not lag. • Ensure false positives don’t happen: users should not report Tier 0 as “momentous” due to design drift.

3. Onboarding for friend testing (Prototype and V0)

1) Recommendation / design direction Use a 60–90 second, 3-step onboarding with progressive disclosure: Screen 1 (what it is): “A reflection tool that turns a voice memo into a three-card reading.” Subtext: “Not fortune-telling; no predictions.” Screen 2 (what to expect): Show an example reading (static) with Past/Present/Future labels and a highlighted anchor. Screen 3 (consent + calibration): “For this test phase, we keep transcripts so we can calibrate quality. We’ll delete them after calibration.” Provide: “Learn details” (one sheet, not a long policy wall). Then explicit checkbox: “I agree.”

Keep “geometry-based selection” as one sentence only (no pipeline): “Cards are selected to match themes in your memo (not random).”

2. Research findings / patterns worth studying Progressive disclosure is a standard way to keep first-run lightweight while making deeper explanation available. ([The Interaction Design Foundation][6]) Just-in-time privacy notices are a well-established pattern: disclose sensitive processing at the moment the user is about to share the data, in plain language, with a link to fuller details. ([clarip.com][7]) Be careful of “privacy maze” failure modes where details are technically available but hard to find; keep the “Learn details” sheet one tap away and short. ([European Data Protection Board][8])

3. Unresolved tradeoffs / decisions • Whether to mention “AI” explicitly in onboarding. For trust, it may be necessary; for ritual, it may be jarring. • Whether to show an explicit deletion date vs. “after calibration.” Dates build trust but require operational rigor. • Whether to require an explicit checkbox every time for transcript retention during V0 (higher friction) vs. one-time consent (lighter).

4. Prototype / user-test first • Comprehension test with 5–10 invited friends: after onboarding, ask them to explain (a) what it is, (b) what it isn’t, (c) what data is stored and for how long. • Tone test: does consent copy feel alarming? Iterate until it reads “honest, calm, non-lawyerly.” • First-run readiness: do users understand how long to speak and what kind of content works?

4) Scaffolding layer design

1. Recommendation / design direction Scaffold only where users get lost, and keep it optional: • Past/Present/Future labels should include micro-definitions in a single line under the header: “Root / Active / Trajectory.” • Card tap reveals a compact “card gloss” sheet: 5–8 keywords + one short paragraph describing the card archetype in interiority-first language. No history lesson. • The MatchScore band is not shown; instead, the reading type is implicitly communicated: – Commit: no meta preface. – Exploratory: “Two plausible readings” header (as above). – Abstain: “Not enough to work with yet.”

2. Research findings / analogous products Tarot learning apps commonly scaffold with “easy-to-understand meanings,” keyword lists, and optional deeper lessons; the key pattern is that interpretation is primary and education is secondary/optional. ([app.labyrinthos.co][9]) Minimalist tarot aesthetics (e.g., Golden Thread) demonstrate that stripping clutter can increase clarity; your scaffolding should follow that: concise keywords, no dense encyclopedia. ([Golden Thread Tarot][5])

3. Unresolved tradeoffs / decisions • How much to show on the default reading screen vs. behind taps. Too little and novices feel unmoored; too much and you crowd the reading. • Whether to include a “Why this card?” affordance. Given your “don’t explain geometry” constraint, you should avoid causal claims; at most: “A few themes this card often speaks to…” (non-technical, non-justificatory). • Whether to include the Rider-Waite imagery at all times (likely yes, since your anchor references canonical details).

4. Prototype / user-test first • First-time user test: can a tarot novice explain what they received after one reading without opening any help? If not, adjust the micro-definitions. • Card gloss sheet length: test 50–80 words vs. 120–150 words; measure comprehension and “felt preachy” reactions. • Exploratory comprehension: do users understand Lens A vs Lens B without thinking one is “wrong”? If confusion persists, rename to “Path A / Path B” or “Theme A / Theme B” and soften framing.

[1]: https://www.nngroup.com/articles/progress-indicators/?utm_source=chatgpt.com "Progress Indicators Make a Slow System Less Insufferable"
[2]: https://blog.prototypr.io/headspaces-6-mindful-technology-design-principles-ee3e9a3f784b?utm_source=chatgpt.com "Headspace's 6 Mindful Technology Design Principles - Prototypr"
[3]: https://www.smunson.com/portfolio/projects/lukoff_Mindfulness_DIS2020.pdf?utm_source=chatgpt.com "From Ancient Contemplative Practice to the App Store"
[4]: https://untanglegrief.com/?utm_source=chatgpt.com "Untangle Grief | Bereavement & Grief Support"
[5]: https://goldenthreadtarot.com/?utm_source=chatgpt.com "Golden Thread Tarot: Learn How to Read Tarot Cards Free ..."
[6]: https://www.interaction-design.org/literature/topics/progressive-disclosure?srsltid=AfmBOoqW5NB8hXzVg55Xg4zLEx0VmsdWJLxbt8kK9fIR1DcJpxiKsXVZ&utm_source=chatgpt.com "What is Progressive Disclosure? | IxDF"
[7]: https://www.clarip.com/data-privacy/just-time-notices/?utm_source=chatgpt.com "Just in Time Privacy Notice for GDPR Compliance"
[8]: https://www.edpb.europa.eu/system/files/2023-02/edpb_03-2022_guidelines_on_deceptive_design_patterns_in_social_media_platform_interfaces_v2_en_0.pdf?utm_source=chatgpt.com "Guidelines 03/2022 on Deceptive design patterns in social ..."
[9]: https://app.labyrinthos.co/?utm_source=chatgpt.com "Labyrinthos Tarot App"
