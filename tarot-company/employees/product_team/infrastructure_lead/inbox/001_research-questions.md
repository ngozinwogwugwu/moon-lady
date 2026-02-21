# Research Questions — Infrastructure Lead
**To:** Infrastructure Lead
**From:** Petra Voss — Systems Architect
**Date:** 2026-02-21
**Re:** Deep research questions based on the V0 system sketch
**Reference:** employees/product_team/systems_architect_petra_voss/deliverables/system-sketch.md

1. Provider abstraction layer — implementation pattern: The abstraction layer must wrap all AI model calls with a common interface. What is the right pattern for V0 — a thin wrapper class, a library (e.g., LiteLLM), or a custom implementation? Research: what are the tradeoffs between off-the-shelf provider abstraction libraries and a custom implementation for this system's requirements (temperature=0 enforcement, structured JSON output, telemetry logging per call)?
2. V0 deployment target: What is the right hosting environment for V0 (friend testing, 10–50 users)? Options include a single managed cloud server (Railway, Render, Fly.io), serverless (Vercel + managed database), or a self-hosted VPS. Research tradeoffs for: (a) cold start latency (10-second ceiling), (b) ease of deployment, (c) cost at V0 scale, (d) upgrade path to V1.
3. Stage B cache implementation: The cache key is (card_id, orientation, spread_shape, matchscore_band, position, major_tier). What is the right cache backend — Redis, in-memory LRU, or simpler? What is the cache warming strategy? How does cache invalidation work on ontology version bump?
4. Telemetry infrastructure: The calibration dashboard requires the telemetry log to be queryable by (matchscore_band, hollow_flag, scarcity_mode, ontology_version_id). For V0 scale, what is the right telemetry infrastructure — a structured log file queried with jq/DuckDB, a lightweight managed analytics tool, or a proper time-series store? Research: what is the simplest queryable telemetry setup a small team can operate without a dedicated data engineer?
5. Determinism test in CI: The CI pipeline must include a determinism check: run the same test transcript through the full pipeline twice and assert output identity. What does this test look like technically? What are the failure modes, and how does the test surface each one?
