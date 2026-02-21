# Research Questions — Head of Product
**To:** Head of Product
**From:** Petra Voss — Systems Architect
**Date:** 2026-02-21
**Re:** Deep research questions based on the V0 system sketch
**Reference:** employees/product_team/systems_architect_petra_voss/deliverables/system-sketch.md

1. V0 Definition of Done: What are the measurable criteria for V0 to be considered complete? Define across three dimensions: (a) calibration quality — what MatchScore reliability curve target do we need to ship?, (b) system correctness — what determinism test pass rate is required?, (c) ritual integrity — how do we verify the warm no, stalker card, and voice constraints are implemented correctly?
2. Canon Constitution operationalization: The Canon Constitution (N-1) defines versioning rules and change governance for the ontology. What does this look like as an operational workflow? Who proposes a change, who reviews it, what is the approval chain, and what happens to live sessions when an ontology version is bumped?
3. Calibration dashboard requirements: The calibration dashboard must support the decisions: (a) are MatchScore thresholds correctly calibrated?, (b) is the hollow flag rate acceptable?, (c) is the MajorScore tier distribution matching the intended life-scale mapping? What does this dashboard need to show, and who uses it and when?
4. Decision log structure: You are responsible for the decision log that keeps governance choices legible over time. What is the minimum viable decision log format? What decisions must be logged (ontology versions, threshold changes, data posture transitions), and what tooling supports this without becoming overhead?
