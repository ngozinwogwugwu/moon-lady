# Cross-Session: Geometry / Voice Boundary
**Date:** 2026-02-21
**Participants:** Ilya Moreau (Symbol Architect), Amara Vale (Ritual Designer)
**Purpose:** Draw the explicit boundary between what the geometry hands the voice and what the voice must do on its own.
**Sprint reference:** I-1 / A-1
**Output:** Shared boundary definition; feeds both `dispersion-map.md` and `voice-constraints.md`

---

## Setup

**Ilya:** I want to start by being concrete about what the geometry actually produces. Not in principle — what it literally outputs per reading. Because I think we've been talking about this abstractly and it's causing confusion about whose territory things belong to.

For any given reading, Stage A produces: a card_id, a position in polarity space as a coordinate vector across six axes, an Arcana type (Major or Minor), a MajorScore, and a position in the spread (which slot — Past, Present, Future, or equivalent). That's what the geometry hands to Stage B. That's what the voice receives.

**Amara:** And what it doesn't hand is everything the user actually feels when they read the interpretation. Which is most of what matters.

**Ilya:** Right. The geometry knows *what*, not *how*. But I'd push back slightly — I think the geometry hands more than people realize. The polarity position doesn't just tell you what card it is. It tells you where that card sits relative to everything else in the system. A card at the extreme vector of the Stability axis isn't just "a stable card." It's as far from Volatility as you can be. That opposition is load-bearing. The voice can use it.

**Amara:** That's the thing I wanted to understand better. Because in the meeting I said the two-interpretation structure — shadow/gift, inner/outer — was a voice decision. And you said nothing. But if the polarity axis already encodes a polarity, then the geometry is *giving* me the two interpretations. I just have to express them.

**Ilya:** Exactly. Every card has an antipode — the card at the opposite pole on its primary axis. The voice doesn't have to invent shadow/gift. The geometry already knows what the shadow is. It's the other end of the axis.

**Amara:** That changes how I write the drift guidelines. I thought I was constructing the tension. I'm not — I'm translating it.

---

## Working Through the Boundary

### 1. What the geometry hands the voice

*Agreed list, finalized in this session:*

- **Card identity** — `card_id`, canonical name, Arcana type
- **Primary axis** — which of the six axes the card is most strongly expressed on, and which pole (e.g., Stability+, Volatility−)
- **Arcana weight** — Major (extreme vector) or Minor (mid-range). This is a signal about interpretive gravity, not just categorization.
- **Antipode** — the card at the opposite pole. Always known. The geometry gives this without the voice asking.
- **Spread shape** — whether the three selected cards cluster near the same axis or are dispersed across different axes. Clustered = coherent reading. Dispersed = tensioned reading.
- **MajorScore** — confidence in the selection. The voice may use this to calibrate how assertively it interprets, though this needs to stay invisible to the user.

**Ilya:** The spread shape signal is one I haven't formalized yet but I think it's important. If all three cards in a spread sit near the same axis, the reading has a theme — the geometry is pointing at one thing from three angles. If they're dispersed, the reading is about tension between different parts of the self. Those are different readings structurally, and the voice should handle them differently.

**Amara:** I agree. I'd go further — a clustered spread probably wants a shorter, more focused interpretation. A dispersed spread wants more space. The geometry is telling us the register.

---

### 2. What the voice must provide independently

*Agreed list, finalized in this session:*

- **The anchor** — the specific image detail, stated observable, or small practice that keeps the drift from becoming hollow. The geometry does not produce this. The anchor has to come from the card art or from canonical keywords written into the card definition.
- **The human bridge** — what translates polarity coordinates into felt experience. "You are near the Stability pole" means nothing to a user. The voice is what makes that meaningful.
- **Register** — tone, length, warmth, formality. The geometry signals which register is *appropriate* (Arcana weight, spread shape), but doesn't produce the register itself.
- **Drift path** — the specific associative movement of the interpretation. The geometry sets the starting point; the voice determines the path.
- **The closing question or practice** — how the interpretation ends and returns agency to the user. Entirely voice territory.

---

### 3. The anchor problem — a joint deliverable

**Amara:** The anchor is the thing I'm most concerned about. I said in the meeting that the anchor has to be an image detail on the card, a plainly stated given, or a small practice. But right now the card definitions don't have canonical image details. That's not my deliverable — that's yours. If you don't write image anchors into the ontology, I have to either invent them in the voice spec (which is wrong) or leave the anchor as a formula ("reference an image detail from the card") that doesn't actually anchor anything.

**Ilya:** You're right. The anchor layer needs to be in the card definitions. Each card in the dispersion map should have: the primary axis, the polarity position, the Arcana type, theme keywords — and one canonical image anchor. A single concrete visual detail that the voice is permitted to name.

**Amara:** One is enough. More than one and the voice will use whichever feels safe rather than whichever is specific.

**Ilya:** One canonical anchor per card. I'll add it to the dispersion map format. That makes it a joint output — I produce the anchor, you encode how the voice uses it.

**Amara:** And the voice spec will say: the anchor is always named first, before drift begins. That's the rule. It's what keeps the reading from opening with abstraction.

---

### 4. Major vs Minor Arcana — register calibration

**Ilya:** The Arcana type should do more work in the voice than it currently does. A Major Arcana card being an extreme vector means the system is very confident it's pointing at something significant. That should feel different from a Minor Arcana interpretation.

**Amara:** Different how, specifically? I need rules, not feelings.

**Ilya:** Major Arcana: less drift, more weight, more silence at the end. The card is doing more of the work — the voice doesn't need to elaborate as much. Minor Arcana: more drift is appropriate because the card is a structural pattern, not an archetype. You have more interpretive latitude.

**Amara:** So Major → shorter, more still, the closing question is more open. Minor → longer permitted drift, the closing question can be more specific.

**Ilya:** Yes. And one more thing — in a spread with a Major Arcana, the Major takes interpretive precedence. The Minor cards in the same spread should drift toward the Major's axis, not away from it. The voice should feel unified, not random.

**Amara:** That's a drift constraint I didn't have. Good. I'll encode it: Minor cards in a Major-present spread drift toward the Major's primary axis.

---

### 5. Spread shape and register

**Amara:** Let's settle the clustered vs dispersed question now so I can write the register rules.

**Ilya:** Clustered spread — all three cards within roughly the same region of polarity space, same one or two axes dominant. The geometry is pointing at one theme from different angles. The voice should treat it as a coherent reading: name the theme directly, then interpret each card as a different facet of it.

**Dispersed spread** — cards spread across different axes, possibly even opposing poles. The geometry is saying the user is in tension. The voice should not try to resolve that tension — it should hold it. More space, less synthesis, the closing question should acknowledge the tension rather than bridge it.

**Amara:** So the voice spec needs two register modes at the spread level: Coherent and Tensioned. Each has its own structure.

**Ilya:** Exactly. And I'll signal it in the Stage A output as a spread_shape field: `"coherent"` or `"tensioned"`. Threshold for coherent: all three cards within — I'll define this when I write the dispersion map, but probably within 40% of polarity space. Dispersed beyond that = tensioned.

**Amara:** I can write the register rules against that signal. Good.

---

### 6. What the voice gets but doesn't show

**Amara:** One more thing. The MajorScore. The voice receives it. Should it ever change the interpretation based on it?

**Ilya:** The voice shouldn't reference it. The user never sees it. But internally — if MajorScore is low, the voice should lean toward offering two interpretations rather than one, and the closing question should be more open. High MajorScore: more specific. Low: more exploratory.

**Amara:** That's a calibration rule, not a voice rule. I'll note it in the voice spec as a behavior the interpreter follows, but I'll flag it for the ML Product Lead too — because if MajorScore is low, the voice is effectively handling the low-confidence case, and they need to know that's the mechanism.

---

## Resolved Decisions

| Decision | Resolution | Owner |
|---|---|---|
| Two-interpretation structure (shadow/gift) | Generated from geometric antipode, not constructed by voice | Ilya provides antipode in card definitions; Amara encodes how voice uses it |
| Anchor layer | One canonical image anchor per card, written into ontology | Ilya produces; Amara encodes usage rule: anchor named before drift begins |
| Major vs Minor register | Major → less drift, more weight, more silence; Minor → more drift latitude | Amara encodes in register rules |
| Major takes spread precedence | Minor cards drift toward Major's primary axis when Major is present | Amara encodes as drift constraint |
| Spread shape signal | Ilya outputs `spread_shape: coherent / tensioned` from Stage A | Ilya defines threshold in dispersion map; Amara writes two register modes |
| MajorScore usage | Voice behavior shifts (specific vs exploratory) but score stays invisible to user | Amara notes in voice spec; flags calibration behavior for ML Product Lead |

---

## Territory Map

### Ilya owns:
- Polarity coordinates per card
- Arcana type and weight
- Antipode mapping (which card is the shadow of which)
- One canonical image anchor per card
- `spread_shape` signal logic and threshold
- Keyword set per card (5–8 terms)

### Amara owns:
- How the voice uses the anchor (usage rule, timing)
- How the voice translates polarity coordinates into language
- Register rules per Arcana type and spread shape
- Drift path structure and constraints
- Closing question / practice format
- MajorScore behavioral note (flagged to ML Product Lead)

### Joint output (feeds both specs):
- The anchor format: `{ card_id, anchor_text, anchor_type: "image" | "given" | "practice" }` — Ilya writes the content, Amara writes the usage rule. Both specs reference it.
- The spread shape register: Ilya defines the threshold, Amara defines the two modes. The split must be consistent across both documents.

---

## What Remains Open

- **Image anchor sourcing**: the anchor should ideally reference the actual card art. Until the illustrator is engaged, Ilya will write placeholder anchors using descriptive language that can be updated when art exists.
- **Antipode in expanded readings**: does the voice ever name the antipode card explicitly, or only use it to generate the second interpretation? Amara to decide when writing drift guidelines.
- **Low-signal edge case**: if Stage A returns `status: needs_more_input`, the voice receives no card at all. What does it say? Not resolved here — flagged for Amara's voice spec and Daniel's infrastructure memo.

---
