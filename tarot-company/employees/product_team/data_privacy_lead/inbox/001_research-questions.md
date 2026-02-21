# Deep Research Prompt — Data & Privacy Lead

## Context

You are the Data & Privacy Lead for a tarot-based reflection product. The product takes a user's spoken transcript (voice memo), runs it through a two-stage AI pipeline, and returns a three-card tarot reading. Everything below is what has been built and decided so far.

### What the product does and what it stores

1. The user submits a **voice memo**. The audio is transcribed to text. The audio is then deleted.
2. The transcript is normalized and sent to **Stage A** (feature extraction), which extracts a polarity feature vector and selects three tarot cards.
3. **Stage B** (interpretation generation) receives only the card selection (never the transcript) and generates a reading.
4. The reading is returned to the user.

### What data exists in the system

| Data | Description | Sensitivity |
|---|---|---|
| Voice memo audio | User's voice, speaking about their emotional state | High — deleted after transcription |
| Transcript | Full text of the user's spoken reflection | High |
| Feature vector | Six-axis polarity coordinates extracted from the transcript | Medium |
| Spread | Three selected cards with orientations and scores | Low |
| Interpretation text | The generated reading | Low |
| Telemetry events | Pipeline performance logs (latency, model ID, cache hits, etc.) | Low |
| Calibration labels | Human rater assessments (hollow flag, appropriateness, axis alignment scores) | Medium |
| User feedback | "Doesn't feel right" flags per card | Low-Medium |

### Current data posture: calibration retention exception

The product's default posture is **deletion-first**: delete data as soon as its purpose is served. But for V0, there is an active exception:

**Transcripts are retained during the calibration phase.** This is required for human raters to evaluate whether the system made appropriate card selections. Without retained transcripts, the calibration loop cannot function. The transcript is essential evidence for rating whether Stage A's feature extraction was accurate.

This exception applies to V0 only. The deletion-first posture is intended to be restored after calibration succeeds.

### Calibration target and posture transition trigger

The transition back to deletion-first is triggered when calibration succeeds:
- **Target:** ≥70% of Commit-band readings rated "appropriate" by human raters
- **Mechanism:** The MatchScore reliability diagram reaches the target shape
- Once the target is met, transcripts are deleted, and going forward they are deleted after Stage A completes (after feature extraction)

After posture transition, what the system retains long-term:
- Spread (card selection)
- Interpretation text
- MatchScore band per card
- Ontology version ID
- Calibration metadata (rater labels, hollow flags)
- Telemetry events (stripped of transcript references)

What is deleted:
- Raw transcripts
- Raw audio (always deleted after transcription, even during calibration)
- Feature vectors (deleted after spread is selected, unless retained for calibration debugging)

### User identity

Users are identified by a **hashed user ID** (`user_id_hash`). Raw user IDs are never stored in session records. The hash is applied at the application layer before any persistence.

For the prototype: no authentication, device token or anonymous session.
For V0: authentication via Firebase or similar off-the-shelf provider.

### Session contract (key fields stored per session)

```
session_id: UUID
user_id_hash: hashed identifier
ontology_version_id: e.g., "v0.1.0"
scarcity_mode: "strict" | "relaxed"
transcript_hash: SHA-256 of normalized transcript (not the transcript itself)
stage_a_output: feature vector, domain detected, spread shape, major tier, cards (with scores)
stage_b_input: spread contract only (no transcript, no feature vector)
stage_b_output: interpretation text, cache hit flag
session_metadata: timestamps, latency, model provider/ID
```

During calibration retention: the transcript text itself is also stored (this is the exception).

### Encryption requirements

- All stored session data: AES-256 encryption at rest, per-user key
- Transcripts: AES-256, per-user key
- Telemetry logs: encrypted at rest
- All API calls: TLS 1.3 (no plaintext in transit)
- Key management: secrets manager (AWS KMS, HashiCorp Vault, or equivalent) from day one

### Ontology versioning

The card coordinates, system prompts, and domain assignments form a versioned **ontology** (e.g., v0.1.0). Each session records its ontology version at creation time. When the ontology changes, old sessions retain their version reference — they were evaluated under that version and their labels are version-specific.

### V0 user population

V0 users are invited friends and testers — a small, known group (10–50 people). They are submitting emotional content (voice memos about their inner life). The product is not yet public. This population has a relationship with the founder; the privacy posture should reflect that trust, not just minimum legal compliance.

### User feedback

V0 includes a "doesn't feel right" affordance: users can flag that a card selection doesn't resonate. This is stored as a telemetry event (session ID, card flagged, MatchScore band, ontology version). No free-text is collected.

---

## Your Research Questions

You are the Data & Privacy Lead. You own the data posture, consent framework, user rights, and the governance of the retention → deletion-first transition. Answer the following questions in as much concrete detail as possible.

**1. Calibration retention → deletion-first transition**

The transition back to deletion-first must happen cleanly and verifiably. Design this transition:

- **Technical mechanism:** How does the application layer enforce deletion-first after the transition? The retention policy must be configurable without code changes. What does the policy flag look like, and how does flipping it affect in-flight and future sessions?
- **Transcript disposal:** When the transition is authorized, what happens to transcripts that were retained during calibration? Options: (a) delete all retained transcripts immediately, (b) archive in long-term cold storage with restricted access, (c) anonymize (strip user_id_hash linkage). What is the right choice, and what are the legal and ethical considerations for each?
- **Authorization:** Who authorizes the transition? What evidence (the reliability diagram reaching target) is required? What is the paper trail?
- **Risk:** What if calibration never reaches the target? Is there a time-based fallback (e.g., "transcripts are deleted after 6 months regardless of calibration status")?

Research: how do other AI products with training/calibration data retention manage this transition? What does GDPR and CCPA say about retention periods tied to product development purposes?

**2. Informed consent for V0 users**

V0 users are friends submitting emotional voice memos that are being retained for calibration. Informed consent here is an ethical requirement above the legal minimum.

- What does informed consent look like for this population? What must users understand before they submit their first memo?
- Specifically: (a) that voice audio is transcribed and then deleted, (b) that the transcript text is retained during the calibration phase, (c) what "calibration phase" means and when it ends, (d) what the transcript is used for (human raters evaluate whether the card selection was appropriate — raters see the transcript), (e) what rights the user has (export, deletion).
- What is the right consent interface — a checkbox, a summary screen, a full document, a conversation? Research: what do the best privacy-forward products do for informed consent during testing phases?
- What is the legal minimum for the user population and jurisdiction? What is the ethical standard above the legal minimum for a product handling emotional content?
- How does consent work if the product changes (e.g., calibration phase ends and posture transitions) — do users need to be re-notified?

**3. Export and ethical exit pathway**

If a user wants to know what data the system holds about them, or wants to delete everything, what does that look like?

- **Export:** What does a user receive in a data export? Include a complete list of fields. Is the export machine-readable (JSON), human-readable (PDF summary), or both?
- **Deletion:** If a user requests deletion during the calibration retention phase, does the transcript get deleted immediately (even though it's being retained for calibration)? Is there a tension between user rights and the calibration requirement?
- **Partial deletion:** Can a user delete a single session while keeping others?
- **Right to be forgotten:** After the deletion-first transition, when transcripts are already deleted, what is the deletion pathway for the remaining session data (spread, interpretation, telemetry)?
- Research: how do analogous emotional/reflective products (journaling apps, therapy platforms, meditation apps) handle export and deletion requests? What does GDPR Article 17 require?

**4. Ontology version in stored sessions**

Each session records its `ontology_version_id`. When the ontology changes (card coordinates updated, system prompt revised), past sessions reference an outdated version.

- **Interpretability:** When a user views a past reading, it was generated under a previous ontology version. If the same transcript were submitted today, the card selection might differ. How should the product communicate (or not communicate) this to the user?
- **Calibration validity:** Human rater labels are version-specific. Labels from ontology v0.1.0 are not directly comparable to labels from v0.2.0. How does the product manage this in the calibration dataset? Does the reliability diagram need to be recomputed per ontology version?
- **Data retention:** When an ontology version is retired, are the session records from that version subject to different retention rules? Or are all sessions governed by the same posture regardless of version?
- Research: how do analogous systems (recommendation models, search ranking changes, diagnostic tools) handle the versioning of stored outputs when the underlying model changes?

---

## Output format

For each question, provide:
1. A concrete recommendation or policy design
2. Legal/regulatory context (GDPR, CCPA, relevant precedents)
3. Ethical considerations beyond the legal minimum
4. Implementation notes for a small team
5. Any unresolved tradeoffs the team must decide
