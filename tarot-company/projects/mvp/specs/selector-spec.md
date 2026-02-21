# Symbol System Constraints (V0)

Defines V0 symbolic modeling: dimensions, Stage A extraction, card requirements, matching, constraints.

---

## Modeling Framework

Six polarity axes (-1 to +1):

| Axis | -1 | +1 |
|---|---|---|
| Creation ↔ Destruction | Destruction | Creation |
| Attachment ↔ Release | Release | Attachment |
| Expansion ↔ Containment | Containment | Expansion |
| Order ↔ Chaos | Chaos | Order |
| Isolation ↔ Connection | Isolation | Connection |
| Clarity ↔ Confusion | Confusion | Clarity |

Structural signals: **Intensity** (0–1), **Scope** (0–1), **Agency** (0–1), **Domain** (5 buckets: Emotional, Relational, Material, Identity, Conflict/Cognitive).

---

## Stage A: Feature Extraction

Receives transcript → structured feature vector (6 polarity axes + intensity + scope + agency + domain). Does not interpret. Reduces speech to symbolic coordinates.

---

## Card Ontology (18 cards)

Each card: id, name, arcanaType, polarity vector (6 axes), intensity, scope, domain bias, themes (5–8 keywords). Themes for Interpreter only. Numeric vectors for selection.

---

## Arcana Gate

Allow max 1 Major Arcana if: intensity ≥ threshold AND scope ≥ threshold. Else all Minor. Thresholds defined in MajorScore rubric.

---

## Selection Pipeline

1. Apply Arcana Gate + soft domain filter
2. Weighted cosine similarity (polarity: high, scope: high, intensity: moderate, agency: moderate)
3. Diversity enforcement: penalize similarity > 0.85 to already-selected cards
4. Assign to Past / Present / Future (uniform weighting in V0)

---

## Design Guardrails

Max 6 polarity + 3 structural signals. Cards spread across polarity space. Major Arcana: extreme vectors. Minor Arcana: mid-range patterns. No literal keyword matching.

## Non-Goals (V0)

No personalization, longitudinal recurrence penalty, adaptive ontology, weather biasing, or extended archetype layers.

---

## Amendment: Selection Architecture (V0)

Pipeline: Stage A → feature vector → Arcana Gate → cosine similarity ranking → diversity enforcement → Past/Present/Future assignment. Max 1 Major per spread. 18-card ontology. No longitudinal penalty.
