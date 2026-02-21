# Deep Research Debrief — All Hands
**Date:** 2026-02-21
**Format:** Opening intros → Round-robin discussion
**Present:** Ngozi (CEO), Amara Vale (Ritual Designer), Ilya Moreau (Symbol Architect), Daniel Kwan (Systems Operator)
**Strategy Team:** Dormant — observing only until V0 live testing conditions are met

---

## Purpose

Each team member completed two rounds of deep research before this sprint: one batch on V0 implementation questions, one batch on long-term vision. This meeting surfaces what surprised us, what we're still uncertain about, and what we need to decide together before the next sprint.

**Format:** Everyone opens with a headline, a sub-headline, and two questions — one they're carrying from their research, one they want to put to the room. Then we rotate for longer discussion.

---

## Opening Round: Intros

---

### Ngozi — CEO

**Headline:** The Definition of Done is actually a governance document.

**Sub-headline:** The MajorScore threshold isn't a number we pick — it's a calibration problem, and we don't have a labeled dataset yet.

**Question I'm carrying:**
Who approves the 18-card ontology before we lock it — and what does "locking" actually mean for everything downstream that depends on it?

**Question for the room:**
We keep saying "one reading per day." We've now defined how to enforce it technically. But have we agreed on *why* — and does the why change the how?

---

### Amara Vale — Ritual Designer

**Headline:** Drift is not permission to wander. It's a discipline.

**Sub-headline:** The research kept returning to one failure mode: readings that feel hollow — not wrong, just generic. Hollowness is a design problem we can solve for intentionally.

**Question I'm carrying:**
Sacred minimalism is a beautiful constraint. But at what point does restraint become exclusion — and who does it exclude first?

**Question for the room:**
We're building Past / Present / Future as the default spread structure. The research surfaced at least four other temporal and spatial frames that avoid the prediction trap just as cleanly — threshold frames, compass frames, inner triads. Are we *certain* Past / Present / Future is the right frame for V0, or did we just reach for the familiar one?

---

### Ilya Moreau — Symbol Architect

**Headline:** The 18 cards are a geometry, not a vocabulary.

**Sub-headline:** If forced to reduce the system to three axes, I know which three I'd keep — and that reduction tells you more about the core worldview than the full six axes do.

**Question I'm carrying:**
Symbols shift meaning through collective use. The research is unambiguous about this. Do we have a plan for when a card starts meaning something different to users than what we designed it to mean?

**Question for the room:**
Should the visual art of the cards be in active dialogue with the polarity geometry — or should they be allowed to develop independently? The answer changes what we hand to an illustrator, and we need to decide before we get there.

---

### Daniel Kwan — Systems Operator

**Headline:** The architecture is an ethics document.

**Sub-headline:** Every retention decision is also a deletion decision. Most products accumulate until forced to delete — we should delete until forced to keep. The research suggests this is both the ethical *and* the cheaper path.

**Question I'm carrying:**
If a major AI provider changes pricing, terms, or capability in a way that degrades the reading experience, what's our fallback? We're more exposed to that risk than the current architecture acknowledges.

**Question for the room:**
What should still exist in a user's session history after five years? Not "what will we store" — what *should* exist. That answer should be driving the data model more than anything else, and I don't think we've named it yet.

---

## Round-Robin Discussion

**Order:** Daniel → Ilya → Amara → Ngozi

Each person takes the floor. The goal is not to resolve — it's to share what surprised you most in the research, where you remain uncertain, and what you want the room to help you think through.

Approximately 10–15 minutes per person, then open for cross-questioning before moving to the next person.

Notes should be captured in this document as the discussion proceeds.

---

## Discussion Notes

*(to be filled in during the meeting)*

### Daniel — Discussion Notes

The thing that surprised me most wasn't a technical finding — it was how quickly the architecture becomes a set of ethical commitments you can't walk back. By the time you have five years of session data, you've already made every important decision. The question is whether you made them consciously.

So let me start there. The research on data accumulation made one thing very clear: there's no neutral default. If you don't decide what to delete, you've decided to keep everything. And "keep everything" is not a safe choice — it's an active one with real costs: storage costs, breach surface, the ethical weight of holding years of someone's inner life. The posture I'd propose is *delete until forced to keep*, not the reverse. That means the session transcript gets summarized and pruned. The spread gets stored. The interpretation gets stored. The transcript itself — the raw voice of what a person said on a hard day — probably shouldn't outlive its purpose.

The second thing. The AI provider dependency risk is real, and we're not accounting for it. Right now the reading experience is built around a specific tier of model capability. If Anthropic changes pricing by a factor of three, or deprecates the model version we're using, or modifies the output format — the reading pipeline breaks. Not degrades. Breaks. The research points to two mitigations: an abstraction layer that lets us swap providers without rewriting the pipeline, and a parallel investment in a smaller, self-hosted fallback. Neither of these is free. But the cost of not having them is that a third party can effectively end the product on a pricing call.

The third thing — and this one I want to put to Ilya specifically — is the ontology as infrastructure. The research on symbolic infrastructure made me think about the ontology the way we think about a database schema: it needs versioning, it needs a migration path, it needs a changelog. Every version of the 18-card set should be stored. If a user had a session two years ago under ontology v1 and we look at it today under v1.3, we should know what changed and be able to interpret that session in its original context. That's not an engineering nicety. That's what makes the archive meaningful.

**For the room:** I want to come back to the five-year session history question, because I don't think we have an answer yet. What I heard in the intros is that we're all thinking about it differently. Amara, you're thinking about what the reading *means*. Ilya, you're thinking about what the symbols *accumulate*. I'm thinking about what the system *holds*. Those are three different things. Before I can build the data model, we need to agree on which of those is primary.

### Ilya — Discussion Notes

I want to pick up the thread Daniel left — specifically the ontology versioning point — but come at it from the other side. Daniel is asking: how do we store a symbol's history so the archive stays interpretable. My question is earlier in the chain: what constitutes a change that *requires* a version bump? Because a symbol can shift meaning in two very different ways. One is us deciding to redefine it — that's a clean governance event, it gets a version number. The other is the community quietly reweighting it through use, card by card, session by session, until the symbol means something different in practice than it does in the spec. That second kind doesn't have a version number. It's invisible until it isn't.

The research is clear that this happens. It's not a theoretical risk. Symbols accumulate connotation through collective use the same way words do. The Cooper Hewitt work I found is straightforward about it: "symbols are always changing, driven by the people who use them." The raised fist. The smiley face. These things shift and the shift precedes any formal acknowledgment that a shift occurred. So the honest version of Daniel's versioning system also needs some kind of signal for *semantic drift* — not just "we changed the spec" but "the community has moved."

I don't know how to build that yet. But I think we need to name it as a problem before we lock the ontology.

The second thing. My headline is that the 18 cards are a geometry, not a vocabulary. I want to explain what I mean by that, because I think it has practical consequences. A vocabulary is a list. You look things up. A geometry is a space — you navigate it. The polarity axes mean that every card has a position relative to every other card, and that position carries information the card's name doesn't. A card at the extreme vector of one axis means something different from a card that's mid-range on three axes, even if both cards sound similar in prose. The geometry is the actual spec. The names and descriptions are the translation layer.

This matters for the AI model question. The research turned up a framework called SymbA that compiles over a thousand signifier-signified symbol pairs — "rose: love," "lion: courage" — as training data. That's a vocabulary approach. It could make Stage A more coherent. But a fine-tuned model trained only on symbolic pairs won't understand that the card at the pole of one axis is the *opposite* of the card at the other end — not just a different thing, but the antipode. The geometry is what gives the opposition its meaning. So whatever we feed Stage A, it needs to encode spatial relationships, not just definitions.

The third thing is the three-axis reduction exercise, because I think it's the most useful diagnostic I ran. If you had to keep only three of the six axes — not because you'd actually do it, but as a forcing function — which three? I went through it, and what came out surprised me: the three I'd keep tell you that this system is primarily about the relationship between a person and their own interiority. Not their relationship to the world, not their relationship to other people. That might be right. But it's worth asking out loud whether that's the worldview we want V0 to embody, because everything downstream — the spread structure, the voice, the kinds of readings that feel "true" — follows from that.

**For Amara:** You raised Past / Present / Future in your intro, and the geometry gives me a specific concern about it. The temporal frame implies motion along a single axis — past to future is a line. But the polarity space is six-dimensional. A three-card spread that maps cards to three moments in time is only using one dimension of the geometry. A threshold frame, or a compass frame, would use the space differently — more like triangulation than a timeline. Whether that matters ritually is your territory, not mine. But the geometric case against Past / Present / Future is that it under-uses the system we built.

### Amara — Discussion Notes

Ilya, I'll take your challenge, because I think you're right and wrong at the same time and I want to say why.

You're right that Past / Present / Future under-uses the geometry. A line through six-dimensional space is a narrow path. But the reason Past / Present / Future works as a ritual frame — and it does work, that's documented — isn't because it's geometrically optimal. It's because users arrive with it already half-understood. The frame does onboarding work before we say a word. The threshold frame, the compass frame, the inner triad — they're all richer in the ways you're describing, and they're all harder to enter cold. That's not a reason to abandon them. But it means the choice of frame is partly a question of who we think arrives at V0 and what they're carrying with them.

What I'd actually push back on is the assumption that the spread frame is fixed. What if V0 uses Past / Present / Future as the entry frame, and the system earns the right to introduce more complex frames as the user's ritual literacy deepens? The research on this is actually clear — beginner readers want guidance; experienced readers want space. The register can shift.

The thing that most surprised me in the research was the Forer effect, and I want to sit with it for a minute because I think it's the central design dilemma for this product. The Forer effect — sometimes called the Barnum effect — is why people rate vague, generally applicable personality descriptions as highly accurate for themselves. It's well-documented. And here's the problem: our interpretation voice is going to rely on a version of that mechanism. Drift, projection space, not pinning the card down too quickly — these are all design choices that invite the user to complete the meaning. Which means we're operating in Forer territory by design.

That's fine. That's actually the right choice. But the same mechanism that makes a reading feel magical can produce the specific feeling of betrayal when a user realizes the text could have applied to anyone. Hollowness isn't the absence of meaning. It's the collapse of the illusion that the meaning was for you specifically. And once that happens, you can't un-happen it. The user doesn't come back.

So how do you stay on the right side of that line? The research gave me a concrete answer: anchor the drift. A masterclass interpreter voice moves associatively but always returns to something specific — an image detail on the card, one plainly stated "given" about what the reader can reasonably observe, one small practice. Not three general possibilities. One anchor. Everything else can drift. But the anchor has to be particular enough that the user feels met, not processed.

That's a voice constraint, not a geometric one. Which is why I want to have a conversation with Ilya outside this meeting about what the geometry hands us and what the voice has to do on its own.

The second thing. The stalker card problem is real and we're going to encounter it before longitudinal controls exist. A user draws the same card three times in a week. Statistically, that's the clustering illusion — we see patterns in random data. But in the practice of divination, a card that "won't leave you alone" is a recognized phenomenon with its own name and its own meaning-making tradition. Both things are true simultaneously. The research didn't tell me which one to honor; it told me I have to honor both without collapsing into either. The line I kept coming back to was something like: *This card is returning. Sometimes that's just chance; sometimes it's a theme you're ready to meet again.* That holds the statistical reality and the ritual reality in the same sentence without lying about either. I think that's the voice posture for any edge case where the system might seem to be making a claim it can't support.

The third thing is accessibility, and I want to be direct about it because I think we're at risk of designing a beautiful product that excludes people quietly. Sacred minimalism as a constraint is meaningful to us. It will be opaque to a significant portion of users. The research on plain language is unambiguous: restraint excludes when it relies on prior cultural literacy. If the voice assumes the user knows what "the liminal" means, or what projection space is, or what a polarity axis implies — we've already lost them. Minimalism can coexist with generosity. The front layer stays minimal; the optional scaffolding stays available. But we need to build the scaffolding, not just admire the minimal front.

**For Ngozi:** The scarcity constraint — one reading per day — I keep bumping up against it from the voice side. You've defined the technical enforcement. But the ritual design question is: does the user know, in the moment, that this is scarce? And if they do know, what does the product say when they try to come back for a second reading? Because that message is a ritual moment too. It's the product's voice at the threshold of "no." I need to know whether that "no" is warm, or firm, or silent, before I can write the rest of the experience around it.

### Ngozi — Discussion Notes

Amara, I'll start there. The "no" is warm and it names the reason. Not "you've already had a reading today" — that sounds like a quota. Something closer to: *"Today's reading is still with you. Come back tomorrow."* The scarcity is a feature of the ritual, not a limit of the system. The voice has to make that felt. So the "no" should sound like the product believes in the constraint, not like it's apologizing for it. That's the answer. I'm confident in it.

Now let me say why I'm confident, because it connects to the most surprising thing the research returned for me.

I went into the long-term vision questions expecting strategic answers — company form, licensing, platform vs product. What I got instead was a frame I didn't have before: the difference between infrastructure and accumulation. Infrastructure is what becomes invisible through embedding. It's what people use without thinking about it because it's so reliable it fades into the background. What I kept reading across the research — in the sociotechnical stuff, in the standards-body governance work — is that the products that become cultural infrastructure don't do it by growing fast. They do it by making one small thing so dependable that people build their lives around it.

One reading per day is not a retention mechanic. It's a structural commitment to that kind of dependability. The reason matters because it determines what we're willing to protect when it becomes inconvenient. If the "why" is retention, we'll relax it the moment we think relaxing it helps retention. If the "why" is that scarcity is constitutive of the ritual — that it's what makes tomorrow's reading mean something — then we hold it even when users push back. I don't think we've said that out loud before. I want to say it now.

The second thing. The MajorScore calibration problem is the thing from the V0 research that I can't resolve without this room.

Here's the shape of it. MajorScore is supposed to tell us whether the system is confident enough in a card selection to commit to it. The research says: a threshold is only defensible if the score is calibrated — if things scored 0.8 are actually right about 80% of the time. You test that with a reliability diagram. You plot score against actual accuracy on a held-out labeled set. If the curve is monotonic, the score is calibrated. If it's not, you correct it. Standard practice.

The problem is the test requires labeled examples. Labeled examples for a symbolic reading system means: here is a transcript, here is the card selection, here is a judgment about whether that selection was appropriate. Who makes that judgment? What makes it right? In a classification system with objective labels, a human annotator can be wrong but at least you know what "right" means. In a symbolic system where appropriateness is partly a matter of interpretation, "right" is murkier. We might be building a threshold for a score we can't actually validate.

I don't think that means we abandon the threshold. I think it means we're honest about the first version being a prior, not a calibrated parameter — we pick something defensible, we log outcomes, and we treat calibration as ongoing work rather than something we complete before launch. But Ilya, I need to know from you: is there a version of "this card selection was appropriate for this transcript" that has enough structure to label? Because if there is, we can build the evaluation set. If there isn't, we're launching with a parameter we're calling a threshold but is actually a guess.

The third thing, and I'll be brief. The long-term vision research pushed me toward a decision about company form that I want to name explicitly, because everything downstream depends on it. We are a single-app company building as if we will eventually be a platform. Concretely: the symbolic canon and the data model are architected with platform-level governance in mind, but the product surface is one thing, tightly scoped, with no external APIs and no creator tools in V0. We are not a product studio. We are not a platform yet. We are a single ritual product with a canon designed to be stable enough to outlast us.

That decision has a corollary the research made clear: we should write a Canon Constitution before the ontology is locked. Not a long document. Just: versioning rules, what constitutes a change, who has standing to propose one, what the deprecation policy is. Daniel wants version control on the ontology — that's right, and it's the technical layer. The Canon Constitution is the governance layer that tells you when to make a new version and who decides. We need both.

**For the room:** The research gave me one question I can't answer alone, and it connects to everything we've discussed today. The V0 handoff package requires golden test vectors — transcripts that map cleanly to card selections, and edge cases that don't. Building those test vectors is also how we build the labeled dataset we need for MajorScore calibration. Which means the test vector work and the calibration work are the same work. Someone has to own it. It sits at the intersection of what Ilya knows about the symbol system, what Amara knows about what a reading should feel like, and what Daniel knows about how to store and evaluate it. It doesn't live cleanly in any one person's deliverable. So before we close: who owns it, or do we treat it as the first piece of work we do together?

---

## Decisions / Open Questions Carried Forward

### Decisions Made

**1. The scarcity "no" is warm and names the reason.**
When a user attempts a second reading, the product says something in the register of: *"Today's reading is still with you. Come back tomorrow."* It does not apologize for the constraint. It affirms it. *Owner: Amara to formalize in interpreter spec.*

**2. One reading per day is constitutive of the ritual, not a retention mechanic.**
This is the stated "why." It determines what we protect when it becomes inconvenient. If a case arises for relaxing the constraint, the burden of proof is on the person proposing relaxation to show the ritual survives it.

**3. Company form is decided: single app, platform-ready canon.**
We are not a product studio. We are not a platform yet. We are one tightly scoped ritual product whose symbolic canon and data model are architected as if they will eventually be a platform. No external APIs, no creator tools in V0. This is locked.

**4. Data posture: delete until forced to keep.**
The session transcript is summarized and pruned after its purpose is served. The spread is stored. The interpretation is stored. The raw transcript — especially audio-derived content — does not outlive its purpose. *Owner: Daniel to formalize in infrastructure risk memo.*

**5. Past / Present / Future is the V0 entry frame, not the permanent frame.**
The temporal structure is the entry point because users arrive with it pre-loaded. The system earns the right to introduce more complex frames — threshold, compass, inner triad — as ritual literacy deepens. This is not a concession; it's a sequencing decision.

**6. Drift requires an anchor.**
The masterclass interpreter voice moves associatively but returns to one specific thing per reading: an image detail on the card, a plainly stated observable given, or a small actionable practice. The anchor is what keeps the reading from hollowness. This is a voice constraint. *Owner: Amara to encode in voice spec.*

**7. Stalker card language is settled for V0.**
Before longitudinal controls exist, the voice holds both the statistical and ritual truths simultaneously. Working language: *"This card is returning. Sometimes that's just chance; sometimes it's a theme you're ready to meet again."* *Owner: Amara to finalize.*

**8. A Canon Constitution is required before the ontology is locked.**
Minimum contents: versioning rules, definition of what constitutes a change, who has standing to propose one, deprecation policy. This is the governance layer; Daniel's version control is the technical layer. Both are needed. *Owner: Ngozi to draft; Ilya to review for symbolic integrity.*

**9. MajorScore V0 threshold is a prior, not a calibrated parameter.**
We will pick a defensible starting value, log outcomes, and treat calibration as ongoing work. We are not pretending it is calibrated before launch. This requires honesty in the engineering handoff documentation.

---

### Open Questions Carried Forward

**Q1. Who owns the golden test vectors — and therefore the labeled evaluation set?**
The test vector work and the MajorScore calibration work are the same work. It requires Ilya's knowledge of the symbol system, Amara's judgment about what a reading should feel like, and Daniel's ability to store and evaluate it. No single person's deliverable covers it. *Decision needed: joint workstream or named owner.*

**Q2. Is there a labelable definition of "appropriate" card selection?**
Ngozi asked Ilya directly. What does it mean, structurally, for a card selection to be right for a transcript in a symbolic system? If we can answer this, we can build the evaluation set. If we can't, we launch with a guess we're calling a threshold. *Ilya to respond before next sprint.*

**Q3. How do we detect semantic drift — the community quietly reweighting a card's meaning?**
Ilya named this as distinct from versioned changes to the spec. It has no version number. It's invisible until it isn't. No mechanism exists yet for detecting or responding to it. *Open: needs a proposal.*

**Q4. Who approves the ontology lock, and by what process?**
The research recommends: product owner accountable, domain expert reviewer, engineering reviewer, privacy reviewer as-needed. This needs to be formalized as the actual approval chain for this team, not a general model. *Owner: Ngozi, in the Canon Constitution.*

**Q5. Does the system's core worldview match the three-axis reduction?**
Ilya's reduction exercise revealed the system is primarily about a person's relationship to their own interiority — not to the world or to others. Is that the right V0 worldview? The spread structure, the voice, and the kinds of readings that feel true all follow from this. *Needs explicit confirmation before ontology is locked.*

**Q6. What is the AI provider fallback plan?**
Daniel named the risk: a pricing or capability change at a major provider can break the pipeline, not just degrade it. Two mitigations were proposed — an abstraction layer and a self-hosted fallback — but neither is scoped or assigned. *Owner: Daniel to scope in infrastructure risk memo.*

**Q7. What does the accessibility scaffolding look like?**
Amara established that the front layer stays minimal and the scaffolding stays optional but must exist. What is the scaffolding? Tap-to-expand definitions? Alternate phrasing? An onboarding track? This is undesigned. *Owner: Amara, flagged for post-V0 unless it blocks the voice spec.*

**Q8. Ilya / Amara cross-session needed.**
Amara called for a direct conversation about what the geometry hands the voice and what the voice must do on its own. The two deliverables — symbol system constraints and interpreter spec — share a boundary that hasn't been drawn. *Schedule before next deliverable deadline.*

---
