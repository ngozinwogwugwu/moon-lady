# Research Questions — ML Product Lead
**To:** ML Product Lead
**From:** Petra Voss — Systems Architect
**Date:** 2026-02-21
**Re:** Deep research questions based on the V0 system sketch
**Reference:** employees/product_team/systems_architect_petra_voss/deliverables/system-sketch.md

1. Golden test vector labeling workflow: 100 transcripts need to be labeled against the appropriateness rubric. Who does the labeling? What is the labeling interface (spreadsheet, custom tool)? How are rater disagreements resolved? What is the minimum inter-rater agreement required before the dataset is considered trustworthy?
2. MatchScore reliability diagram — methodology: Once the golden test vector set is labeled, how do you compute the reliability curve? What is the binning strategy for MatchScore? What sample size is needed in each bin for the curve to be statistically meaningful? Given the dataset is 100 transcripts total, are the bins large enough for V0 calibration, or should the sprint be expanded?
3. MajorScore tier calibration: The three tiers (0.70, 0.83, 0.92) are priors. To calibrate them, raters need to assess: for each spread in the golden test vector set, does the life scale of the transcript match the tier prediction? What label schema do raters apply, and how do you convert those labels into threshold adjustments?
4. Stage A failure detection: If Stage A produces systematically wrong feature vectors for a class of transcript, this contaminates the calibration dataset. What is the protocol for detecting Stage A extraction errors before they cascade? Does the golden test vector set need to include Stage A feature vector ground truth, not just card selection ground truth?
5. Hollow rate as a quality signal: The hollow flag is rater-populated post-session. What is the acceptable hollow rate at the Commit band? If the hollow rate is too high, which component is failing — Stage A (wrong card selected) or Stage B (correct card, hollow interpretation)? How do you diagnose which component is the source?
