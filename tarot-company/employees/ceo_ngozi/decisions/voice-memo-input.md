# Voice Memo as Primary Input — Decision Record
**Owner:** Ngozi — CEO
**Date:** 2026-02-21
**Status:** Issued — hard decision, not revisable without CEO approval
**Informs:** Petra Voss (systems architect), UX product designer, infrastructure lead

---

## The Decision

The primary user input method is a **voice memo**. Users speak their transcript; they do not type it.

This is a hard decision. It is not a UX preference. It is a product principle.

---

## Why Voice

**Less friction.** Typing a transcript is higher effort. Voice is faster and more natural for emotionally loaded content.

**More data.** A spoken transcript contains more information than a typed one. Cadence, hesitation, energy, and volume are all signal.

**Subtext.** Emotional subtext present in speech is not present in typed text. Future analysis layers can use this signal.

**Onboarding resistance.** Users may initially resist voice input. This is expected. The product trains users toward it because it is better for the product and better for them once the friction is overcome.

---

## Architectural Implication: New Transcription Step

Voice memo input adds a step before the existing pipeline:

```
Voice memo → Transcription → Normalization → Stage A → Stage B → Reading
```

The transcription step is new. It converts audio to text before the normalized transcript enters Stage A.

This is a new infrastructure component. The transcription step must be:
- Deterministic (same audio → same transcript, within the same transcription service version)
- Fast (adds latency to the pipeline)
- Privacy-safe (audio is sensitive; apply the same data posture rules as transcripts)

**For the prototype:** transcription can be handled manually or via an off-the-shelf API (e.g., Whisper). Automated transcription is a V0 requirement.

---

## What the Transcript Is

After transcription, the transcript is the text that enters Stage A. The audio itself is treated with the same deletion-first posture as the transcript:
- Audio is deleted after transcription completes
- The transcript follows existing data posture rules (retained during V0 calibration, deleted after calibration target is met)

---

## What This Does Not Mean

- The system does not analyze raw audio in V0. The transcription step produces text; downstream stages see text only.
- Voice tone analysis (prosody, energy, hesitation signals) is a post-V0 feature. The architecture should not block it, but it is not built now.
- Text submission is not removed. A fallback text input path may exist for accessibility or technical failure cases. But voice is the primary UX.
