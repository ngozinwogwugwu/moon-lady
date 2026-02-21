# CEO Decisions Update — Architecture Implications
**To:** Petra Voss — Systems Architect
**From:** Ngozi — CEO
**Date:** 2026-02-21

Four decisions issued today that affect your system sketch. Review and update the sketch as needed.

---

## 1. Prototype vs V0 Distinction

See `ceo_ngozi/decisions/prototype-vs-v0.md`.

Your system sketch describes V0. That is correct — continue scoping at V0 level.

But the build sequence is:

```
Prototype (no auth, always relaxed, no dashboard) → V0 (full spec)
```

The prototype is a subset. Mark in the sketch which components are prototype-required vs V0-only:
- Authentication: V0 only
- Dashboard: V0 only
- Full telemetry: V0 only
- Scarcity enforcement: V0 only (prototype is always relaxed)
- Stage A + Stage B pipeline: prototype and V0

---

## 2. Voice Memo as Primary Input

See `ceo_ngozi/decisions/voice-memo-input.md`.

The user interface is a voice memo. This adds a transcription step before normalization:

```
Voice memo → [Transcription] → Normalization → Stage A → Stage B → Reading
```

Update the system sketch component map to include the transcription component. Add to the open questions list: which transcription service for V0, and how transcription latency affects the end-to-end latency ceiling.

Audio data posture: audio is deleted after transcription, same retention rules as transcript.

---

## 3. Stalker/Current Card Language — Across Sessions in V0

Currently your sketch notes that stalker card language "applies within session window only." This is the prototype behavior (no user history, no cross-session state).

V0 has user history. In V0, the system can detect recurring cards across a user's past sessions and apply stalker card language accordingly. Update the sketch to note:
- Prototype: stalker card detection is within-session only
- V0: stalker card detection spans session history per user_id_hash

This affects what the user session store must retain.

---

## 4. Deck Expansion Roadmap

See `ceo_ngozi/decisions/deck-expansion-roadmap.md`.

The post-V0 evolution path in the sketch should reflect the three-phase sequence:

1. V0: 18 Rider-Waite cards (current)
2. Post-V0: Full 78-card Rider-Waite deck
3. Future: Custom decks (user-described, embeddable, shareable)

Note: the architecture must not foreclose Phase 2 or Phase 3. Specifically, the ontology store and similarity pipeline must be designed to scale beyond 18 cards without architectural change.

---

## 5. User Feedback Storage ("Doesn't Feel Right")

See `ceo_ngozi/decisions/user-feedback-storage.md`.

A new telemetry event: `user.card_feedback`. Add this to the telemetry event set in the sketch. It's a V0 requirement, not a prototype requirement.

The feedback mechanism requires a minimal UX affordance (designed by UX lead) and a new event in the telemetry log. No real-time pipeline changes.
