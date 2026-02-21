# Deck Expansion Roadmap — Decision Record
**Owner:** Ngozi — CEO
**Date:** 2026-02-21
**Status:** Issued — establishes the sequence; each phase requires its own scoping
**Informs:** Ilya Moreau (symbol architect), Petra Voss (systems architect), ML product lead

---

## The Sequence

Three phases, in order. Each phase gates the next.

### Phase 1 — Current (V0)
**18 Rider-Waite cards.** The curated working set. 6 axes, 5 domain buckets, polarity geometry established. This is what ships in V0.

### Phase 2 — Full Deck (post-V0)
**All 78 Rider-Waite cards.** Expand from the working set to the full Major and Minor Arcana. The polarity geometry extends to cover all 78 cards with the same six-axis system. This requires Ilya's full dispersion map for the complete deck.

Phase 2 gates Phase 3. Custom decks require the full canonical deck as a reference and training baseline.

### Phase 3 — Custom Decks (future)
**User-described cards.** Users define their own cards — what a card looks like, what it means to them. Cards can be shared across users.

The system embeds user-described cards in the same vector space as the canonical deck. Embedding happens under the hood. Users do not interact with axis coordinates or polarity geometry directly.

Key properties of Phase 3:
- Card descriptions are free-form natural language
- Embedding is automated — users do not set coordinates
- Custom cards coexist with canonical cards in the same ontology namespace
- Sharing is possible — a user can make a custom card available to others
- The canonical deck remains the reference baseline for calibration

---

## What This Changes About V0

Nothing changes about V0. The 18-card working set is the build target. Phase 2 and Phase 3 are post-V0.

However, the V0 architecture must not foreclose Phase 2 or Phase 3:
- The ontology store must be designed to hold more than 18 cards
- The provider abstraction layer must handle larger card catalogs
- The embedding/similarity pipeline must be scalable beyond 18 entries
- The version ID system must support deck expansion events as version increments

---

## What Phase 2 Requires from Ilya

A full dispersion map for all 78 Rider-Waite cards:
- Six-axis coordinates for each card (upright and reversed)
- Domain bucket assignment for each card
- Image anchor for each card (canonical RW image detail)
- Clustering check across the full 78-card space

This is a post-V0 scoping task for Ilya. No action required now.

---

## What Phase 3 Requires (Research Question, Not Decision)

- How does free-form card description get embedded in the polarity space?
- What is the quality floor for a custom card to be usable?
- How does calibration work for user-defined cards?
- How does sharing work — curation, trust, abuse?

These are product and ML research questions. Not answered now.
