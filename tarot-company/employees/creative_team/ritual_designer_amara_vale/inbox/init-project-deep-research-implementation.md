# Deep Research: Implementation Questions (V0)

1. What is the maximum word count for a single card interpretation in a three-card spread?
2. How does the interpreter handle the Future position — what tense and modal constraints apply?
3. What is the exact list of prohibited phrase patterns beyond the obvious (will happen, destined, guarantees)?
4. How much does each card's themes array shape the interpretation — scaffold, constraint, or background context?
5. What does drift look like in one sentence — can you write an example that captures it precisely?
6. How does the interpreter address the user — "you," "one," or something more impersonal?
7. When a Major Arcana appears, does the tone shift, or is restraint maintained equally regardless of arcana type?
8. What is the structural format of a completed reading — are the three positions labeled, or does the text flow?
9. How do we define "projection space" operationally — what does the interpreter omit to leave room for the user?
10. What are the three sample readings that will anchor the voice spec and serve as the interpretive standard?

# Implementation Research for a Three-Card Tarot Interpreter

## Research basis and interpretation posture

Most “implementation-like” constraints for tarot come from **professional ethics codes** (what readers should and should not claim), plus **standard three-card spread explanations** (how positions are typically framed). Across ethics documents, a consistent posture emerges: tarot is framed as **guidance for insight and reflection**, not an instrument for **control**, **dependency**, or **absolute prediction**. citeturn7view0turn6view0turn5view0

For example, the entity["organization","International Tarot Foundation","tarot school, lancashire uk"] explicitly positions tarot as “insight, reflection, and guidance” and warns against control/dependency and guaranteed outcomes; it also calls out avoiding “fear-based language or dramatic prediction.” citeturn7view0 Similarly, the entity["organization","Tarot Association of the British Isles","tarot org, uk"] emphasizes that readings aim to help the client “take charge of their own life,” recommends referring to qualified professionals where appropriate, and disallows readings about third parties (questions must be rephrased or declined). citeturn6view0 The entity["organization","American Tarot Association","tarot org, us"] code of ethics similarly includes harm-minimization, confidentiality, and referral to licensed professionals outside scope. citeturn5view0

These ethics norms strongly imply the interpreter’s “stance” should be: **non-deterministic**, **agency-preserving**, and **non-diagnostic**, with careful boundaries around medical/legal/financial claims and third-party assertions. citeturn7view0turn6view0turn5view0turn2search6 They also align with consumer-protection and advertising guidance that treats unprovable claims as safer when presented as **opinion** rather than fact—another reason to encode modality (may/might/could) and avoid certainty language. citeturn0search28

## Length and structure controls

**Q1. Maximum word count per single-card interpretation (three-card spread).**  
There is **no universal “tarot industry standard”** for a maximum word count per card; this must be set as a product constraint. citeturn8view0turn10view0 The most defensible way to choose it is to anchor it in readability/attention research and “chunking” practice: users skim, avoid walls of text, and process content better when it’s broken into compact, meaningful units. citeturn10view0turn11view0turn9view0

A practical, research-backed cap is:

**Maximum: 110 words per card-position paragraph.** citeturn11view0turn10view0

Rationale: entity["organization","Nielsen Norman Group","ux research firm, us"] reports that on average, users read only a fraction of on-screen text (with “about 20%” cited as typical), and that users read “half the information” only on pages around ~111 words or less—making ~110 words a useful upper bound for a single “chunk” you actually want read. citeturn11view0 NN/g also summarizes that chunking makes scanning easier and improves comprehension/recall. citeturn10view0

Implementation implication: treat each card interpretation as a **single chunk** (one paragraph), not a mini-essay. citeturn10view0turn9view0

**Q8. Structural format of a completed three-card reading (labels vs flow).**  
A labeled structure is more consistent with scanning and chunking guidance than a continuous flow. citeturn10view0turn11view0turn9view0 It also matches how three-card spreads are commonly taught: each position has a role (e.g., Past/Present/Future), and the reader interprets each card through that positional lens. citeturn0search5turn0search1turn0search13

Recommended output format (concise and implementation-friendly):

- **1–2 sentence framing** (sets non-deterministic stance; names the spread positions). citeturn7view0turn9view0
- **Three labeled sections**: Past, Present, Future (each ≤110 words). citeturn10view0turn11view0
- **1 short “projection space” prompt** at the end (one question or two max). citeturn7view0turn6view0

A minimal skeleton (structure-only) looks like:

Past: [≤110 words]  
Present: [≤110 words]  
Future: [≤110 words]  
Reflection: [1 short question]

image_group{"layout":"carousel","aspect_ratio":"16:9","query":["three card tarot spread layout past present future","three card tarot spread illustration"],"num_per_query":2}

## Future position handling and prohibited prediction language

**Q2. Future position handling (tense + modal constraints).**  
In mainstream three-card teaching materials, the “future” card is often framed as a **likely or possible outcome** if the querent continues on the current path, rather than an unchangeable fate. citeturn0search5turn0search17turn0search21turn2search6 That framing is also congruent with modern ethics statements emphasizing free will, client autonomy, and “no guaranteed outcomes.” citeturn7view0turn6view0

Operational constraints (what the interpreter should do):

- **Primary tense:** present tense for meaning (“This card points to…”, “This can reflect…”), even in the Future position. citeturn7view0turn0search5
- **Permitted modality for Future:** conditional/possibility language: **may / might / could / can / tends to / suggests / points to**, plus explicit conditionals: **“If X continues…, Y may…”** citeturn0search5turn0search17turn7view0
- **Explicit contingency clause (recommended):** at least once in the Future section, make contingency legible (“if things continue as-is,” “based on the current trajectory”). citeturn0search5turn0search17turn6view0
- **No absolute prediction:** avoid language implying fixed inevitability; this is directly aligned with ethics guidance to avoid guaranteeing outcomes and to avoid dramatic prediction. citeturn7view0turn2search6

**Q3. Exact list of prohibited phrase patterns beyond “will happen / destined / guarantees.”**  
Ethics codes don’t enumerate every banned bigram, but they clearly define the _classes_ of language that violate “free will,” “no guarantees,” “no fear-based prediction,” “no third-party readings,” and “no out-of-scope professional advice.” citeturn7view0turn6view0turn5view0turn2search6 Below is an “exact patterns” list that operationalizes those classes for an interpreter.

Prohibited patterns (case-insensitive; examples include near-synonyms):

```text
A) Absolute certainty / inevitability
- "will definitely", "will certainly", "will for sure"
- "without a doubt", "no doubt", "there's no question"
- "inevitable", "unavoidable", "cannot be avoided"
- "set in stone", "guaranteed", "100%"

B) Fate / preordination framing
- "fated", "destined", "meant to happen"
- "the universe has decided", "written in the stars"
- "this is your soulmate/twin flame" (as a certainty claim)

C) Loss of agency / coercive directives
- "you must", "you have to", "you need to" (as imperatives)
- "the only choice is", "you have no choice"
- "do X now or else", "there is nothing you can do"

D) Fear-based dramatic prediction
- "you are cursed", "a curse is on you"
- "something terrible will happen", "disaster is coming"
- "predict death", "you will die" / "someone will die"

E) Third-party mindreading or third-party reading claims
- "he/she/they is cheating"
- "he/she/they will text/call you"
- "what they are thinking" / "their true intentions" (when not the client)

F) Medical/legal/financial/professional substitution
- "you have [diagnosis]" / "you are pregnant" / "you should stop medication"
- "you should sue" / "you will win the case"
- "buy/sell this stock", "you will get rich", "lottery numbers are ..."
```

Why these classes are “beyond obvious,” and why they’re justified:

- **No guarantees; avoid dramatic/fear-based prediction; respect autonomy.** citeturn7view0
- **Readings aim to help the client take charge; don’t control decisions; refer to professionals where appropriate.** citeturn6view0turn5view0
- **No medical/legal/financial/psychological substitution; no predicting death.** citeturn7view0turn2search6turn5view0
- **No third-party readings (must rephrase/decline).** citeturn6view0
- **Prefer “opinion” framing for unprovable claims in advertising contexts.** citeturn0search28

## Themes array influence and drift definition

**Q4. How much does a card’s themes array shape the interpretation (scaffold, constraint, or background)?**  
A “themes array” behaves like a **controlled vocabulary**: a predefined set of terms intended to produce consistency and reduce ambiguity across many outputs. citeturn12view0turn3search1 The entity["organization","Getty Vocabulary Program","controlled vocab program, us"] describes controlled vocabularies as standardized terms that promote consistency and help organize/retrieve information, while still acknowledging that display text may need to express nuance and uncertainty. citeturn12view0

In LLM system terms, a themes array should be treated as **scaffold + constraint** (not mere background). This is consistent with empirical and survey literature describing prompt engineering as _structuring inputs_ to improve relevance/accuracy, and with findings that retrieval/grounding can reduce hallucination-like errors in generated outputs. citeturn3search2turn3search26turn3search7

Operationalization (what “scaffold + constraint” means in practice):

- **Constraint on topical content:** the core interpretation should stay inside the semantic envelope of the themes provided (do not introduce a new “main idea” that conflicts with or is unrelated to the theme set). citeturn12view0turn3search2
- **Scaffold for composition:** pick 1–2 themes as _primary_ (drive the paragraph), and optionally 1 as _supporting_ (adds nuance). This mirrors “content planning” rather than free association and is aligned with structured prompting benefits. citeturn3search2turn3search26
- **Hidden from user:** themes should generally not be printed verbatim; they are internal guardrails, similar to metadata enabling consistent outputs without forcing jargon into display text. citeturn12view0turn3search1
- **Position acts as a second constraint:** the same card themes should be reframed by position (Past = context, Present = current dynamic, Future = conditional trajectory), matching common three-card conventions. citeturn0search1turn0search5turn0search17

**Q5. Drift in one sentence (precise example).**  
Drift example (one sentence): **“Because The Tower is in your Future position, you will definitely lose your job on March 3rd and there’s nothing you can do to stop it.”** citeturn7view0turn3search7

Why this is “drift,” operationally: it breaks the Future-position contingency norm (it’s absolute), adds unjustified specificity (date, job loss), and uses fear-based inevitability language—categories explicitly discouraged by ethical tarot codes and commonly associated with ungrounded generation/hallucination behavior in LLM outputs. citeturn7view0turn3search7turn3search2

## User address, tone, and Major Arcana sensitivity

**Q6. How the interpreter addresses the user (“you” vs “one” vs impersonal).**  
The strongest cross-domain evidence favors **second person (“you”)** for clarity and engagement. entity["company","Microsoft","software company, redmond wa"]’s UI writing guidance explicitly says: “Always address the user as ‘you,’” and also cautions not to assume users will read every word—both directly relevant to interpretation voice and brevity. citeturn9view0 Additional Microsoft guidance similarly supports writing as if speaking directly to the user and using “you” to keep tone human and readable. citeturn0search22

Implementation nuance: “you” does not require being directive. You can keep autonomy by pairing “you” with non-coercive modality: “you might notice…,” “you may be weighing…,” “you could explore…,” consistent with “guidance, not instruction.” citeturn7view0turn6view0

**Q7. When a Major Arcana appears, does tone shift or does restraint remain equal?**  
A standard tarot deck is widely described as **78 cards** split into **22 Major Arcana** (trumps) and **56 Minor Arcana**. citeturn2search4turn2search0 Many teaching resources characterize Major Arcana as representing **deeper, stronger, or longer-term energies**, while Minor Arcana more often track day-to-day fluctuations. citeturn1search21turn1search2

So, a “tone shift” is justified only in a very specific way:

- **Scope shift (allowed):** Major Arcana can be framed more as “big picture lesson / overarching pattern.” citeturn1search21turn1search2
- **Certainty shift (not allowed):** restraint should remain _equally strict_; Major Arcana should not become a license for fate-language, fear-based prophecy, or guaranteed outcomes, because ethical codes explicitly reject “absolute prediction” and “dramatic prediction,” regardless of card type. citeturn7view0turn6view0

In other words: Major Arcana may broaden the lens, but must not harden the claim.

## Projection space as an operational requirement

**Q9. Defining “projection space” operationally (what the interpreter omits).**  
Operationally, “projection space” is the intentionally unfilled portion of the narrative that preserves user agency and allows the querent to map the reading onto their real context—without the interpreter “closing the loop” with unverifiable specifics or coercive directives. This is directly aligned with ethics codes emphasizing free will, non-control, empowerment over dependency, and avoiding dramatic prediction. citeturn7view0turn6view0

Concretely, the interpreter should omit:

- **Identifiers and specifics it cannot know:** names, dates, exact places, definitive events (“on Tuesday…,” “your boss…”). citeturn7view0turn3search7
- **Third-party claims:** thoughts/intentions/actions of non-clients (TABI explicitly disallows readings about anyone other than the client). citeturn6view0
- **Professional-grade advice:** diagnosis, legal strategy, financial directives; ethics codes repeatedly require referral to qualified professionals outside scope. citeturn7view0turn5view0turn6view0turn2search6
- **Inevitability framing and fear-based language:** because it undermines autonomy and contradicts “no guarantees / no dramatic prediction.” citeturn7view0

And it should include (as the “space-making” mechanism):

- **Conditional phrasing in the Future position** (“if the current trajectory continues…”) to keep the future as possibility. citeturn0search5turn0search17turn7view0
- **A small set of interpretive “routes”** (two or three possible ways the theme could manifest) rather than one definitive storyline, preserving ambiguity without becoming vague. citeturn12view0turn7view0
- **One reflective question** that turns interpretation into self-generated meaning (“Where does this show up for you?”), consistent with “take charge of their own life.” citeturn6view0turn7view0

Notably, the Getty controlled vocabulary guidance makes a parallel point in another domain: it can be misleading to fail to express uncertainty in display information, even when backend indexing uses firm rules—this maps cleanly to “structured constraints internally, uncertainty and nuance in user-facing text.” citeturn12view0

## Anchor sample readings for the voice spec

**Q10. Three sample readings that anchor the interpretive standard (three-card, labeled positions, restrained future, “you” address, projection space preserved).**  
(Each card paragraph is written to stay under the recommended 110-word maximum.)

**Sample reading A**

Past: Eight of Pentacles suggests you’ve already been doing the unglamorous part: practicing, refining, and building competence through repetition. If you’ve felt “behind,” this often reframes that as apprenticeship rather than failure. It can also point to a narrow focus—getting very good at one skill while other needs (rest, play, relationships) sit at the edge of the workbench. Useful check-in: which part of your effort feels like genuine craft, and which part feels like proving yourself to someone?

Present: Two of Wands highlights a moment of choice with a wider horizon. You may be assessing expansion—a bigger role, a new domain, or a different environment—while still holding onto what’s familiar. This card favors strategy: sketch the map before you pack the bags. It can also surface productive ambivalence, where planning protects you from committing. If you’re stuck, try naming two options you’d be willing to test in low-stakes ways soon, then watch what your energy does.

Future: The Fool, in a future position, points to a possible fresh start if you keep leaning toward exploration. Rather than a fixed prediction, it describes an attitude: curiosity, openness, and learning by doing. You might be drawn to an unconventional option, but this card tends to reward presence more than bravado. Consider what would make the next step feel both exciting and contained—like a pilot project, a trial period, or one conversation that gathers real information.

Reflection: Where are you ready to be a beginner again—on purpose?

**Sample reading B**

Past: The Lovers suggests this situation has been shaped by a meaningful choice—either choosing a person, or choosing the values you want your relationships to reflect. This isn’t only about romance; it often points to alignment (or misalignment) between desire and principle. If a past decision feels messy, the invitation is to get clear on what you were saying “yes” to underneath the surface. What value were you protecting, and what value might have been sidelined?

Present: Four of Cups shows a present moment of emotional pause. You may be offered something—attention, an apology, an opportunity to reconnect—but it’s landing flat, or you’re not sure it’s the right “cup.” Sometimes this signals fatigue: after disappointment, disengagement becomes a shield. Rather than forcing a feeling, notice what you’re genuinely available for right now. If you could be honest without being harsh, what would you say you need?

Future: Page of Cups as a future card leans toward a softer reset, especially if you stay curious instead of defensive. It can show a message, a sincere gesture, or a new emotional conversation that opens a door—but it doesn’t promise how far it goes. The most helpful stance is to treat it as an invitation to explore, not a verdict. You might try one small act of openness that still respects your boundaries, and see what response it brings.

Reflection: What would “better” look like here if it started with 5% more honesty?

**Sample reading C**

Past: Ten of Swords points to an ending that felt draining, final, or mentally exhausting—like carrying something past the point where it could be saved. This card can be blunt, but it often marks the moment after the worst is over: the pain is real, and it also clarifies what cannot continue. If you’re looking back, focus on the signal beneath the drama: which pattern, belief, or obligation reached its limit?

Present: The Star suggests you’re in a phase of reorientation and quiet repair. It’s less about instant confidence and more about connecting to steadier hope—small practices that restore trust in yourself. This can invite honesty without self-punishment: naming what you want, even if you’re not there yet. In the present, ask: what helps you feel a little more like yourself—even for fifteen minutes?

Future: Six of Pentacles in the future position often points to rebalancing: giving and receiving in healthier proportion. If you keep prioritizing recovery and clarity, you may notice support becoming more accessible—through resources, mentorship, or mutually respectful exchange. It’s also a reminder to check terms: help that comes with strings may not be help. Consider one concrete area where you can ask for what you need (or set a boundary around what you can give) and see what shifts.

Reflection: Where do you tend to over-give—and what would “fair exchange” look like instead?
