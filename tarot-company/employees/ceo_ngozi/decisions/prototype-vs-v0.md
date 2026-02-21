# Prototype vs V0 — Decision Record
**Owner:** Ngozi — CEO
**Date:** 2026-02-21
**Status:** Issued — effective immediately
**Informs:** All product team members, Petra Voss (systems architect)

---

## The Distinction

There are two separate build targets. They are not the same thing.

**Prototype** — minimum viable end-to-end pipeline. Goal: prove the system works for a small set of known users. Fast to build. No hardening.

**V0** — the first real product. Goal: run calibration, collect labeled data, evaluate quality. Has the infrastructure V0 requires.

---

## Prototype Scope

| Feature | Prototype |
|---|---|
| Authentication | None — device token or anonymous session |
| Scarcity | Always relaxed — no feature flag, no enforcement |
| Dashboard | None |
| Calibration sprint | Not required — happens after prototype |
| Telemetry | Minimal — enough to not be flying blind |
| Error handling | Functional, not polished |

The prototype exists to prove the pipeline. It is not a product.

---

## V0 Scope

| Feature | V0 |
|---|---|
| Authentication | Required — off-the-shelf provider (see auth decision) |
| Scarcity | Feature-flagged: `strict \| relaxed` |
| Dashboard | Required — calibration dashboard for evaluation |
| Calibration sprint | Required — 100 labeled transcripts, golden test vectors |
| Telemetry | Full event set (session.started, stage_a.complete, stage_b.complete, etc.) |
| Error handling | Hardened — warm no paths, graceful failures |

---

## What This Changes

- Petra's system sketch describes V0 architecture. The prototype is a subset of V0, not a separate design.
- Do not overbuild the prototype toward V0 features. Build what is needed to close the loop.
- Authentication is a V0 requirement. The prototype has no auth.
- The golden test vector sprint is post-prototype. The prototype does not need 100 labeled transcripts to ship.

---

## Sequence

```
Prototype → evaluation → V0 build → calibration sprint → V1 planning
```

The prototype confirms the pipeline works. V0 is where real calibration begins.
