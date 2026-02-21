# Deep Research Prompt — Head of Product

## Context

You are the Head of Product for a tarot-based reflection product. The product takes a user's spoken transcript (voice memo), runs it through a two-stage AI pipeline, and returns a three-card tarot reading with interpretation. Everything below is what has been built and decided so far.

### What the product does

1. The user submits a **voice memo**. The system transcribes it to text.
2. The transcript is lightly normalized (trim whitespace, normalize casing — no semantic changes).
3. **Stage A (feature extraction):** The normalized transcript is sent to an LLM at temperature=0. The LLM extracts a polarity feature vector across six axes: Stability/Volatility (S), Continuity/Rupture (C), Expansion/Contraction (X), Other/Self (O), Clarity/Obscurity (L), Action/Reception (A). Each axis is a float from -1.0 to 1.0. Stage A also detects a dominant domain bucket (Foundation, Motion, Interior, Relation, Threshold), runs a weighted cosine similarity against an 18-card Rider-Waite subset, applies the Arcana Gate, and outputs a fully specified spread: three cards with IDs, orientations (upright/reversed), and confidence scores.
4. **Stage B (interpretation generation):** Receives _only_ the spread contract — card IDs, orientations, MatchScore bands, spread shape, Major tier. Stage B never sees the transcript or the feature vector. It generates a three-card reading (Past / Present / Future) in a specific voice register.
5. The reading is returned to the user.

### The 18-card deck

Six Major Arcana: The Emperor, The Tower, The High Priestess, The Chariot, The Moon, The Lovers. Twelve Minor Arcana: Ten of Pentacles, Four of Pentacles, Ace of Swords, Ace of Wands, Knight of Wands, Three of Wands, Four of Cups, Seven of Cups, Page of Cups, Two of Cups, Six of Cups, Six of Swords.

### Key metrics

**MatchScore** — polarity match confidence between the transcript's feature vector and the selected card. Three bands:

- Commit: ≥0.65 (high confidence)
- Exploratory: 0.40–0.64 (moderate confidence — reading is offered in two voices)
- Abstain: <0.40 (system returns a warm no: "I don't have enough to work with")

**MajorScore** — Arcana Gate intensity for Major Arcana cards. Three tiers:

- Tier 1: 1 Major Arcana card with score ≥0.70 (once-a-quarter life event)
- Tier 2: 2 Major Arcana cards each ≥0.83 (major life chapter)
- Tier 3: 3 Major Arcana cards each ≥0.92 (defining life moment)

A spread with no Major Arcana above threshold is a Minor-only reading.

### Hollow flag

A reading is **hollow** if: it could apply to >50% of transcripts, lacks a specific anchor (image detail, observable, or small practice), or uses only generic emotional language. Human raters assess hollow flag post-session. It is not automated. A high hollow rate at the Commit band is a quality failure.

### Calibration loop

The product's V0 quality bar is calibration. The system builds a **golden test vector set** of 100 transcripts:

- 40 clear polarity cases
- 30 ambiguous cases
- 15 edge/noise cases
- 15 adversarial/overlap cases

Each transcript is labeled: selected card, second-best card, margin score, structural justification, ritual plausibility rating (1–5), hollow flag. The golden test set becomes the calibration baseline and regression suite.

The calibration target: ≥70% of Commit-band readings rated "appropriate" by human raters.

### Ontology versioning

The card coordinates, system prompts, and domain bucket assignments together form an **ontology**. It is versioned (e.g., v0.1.0). Changing the ontology is equivalent to a schema migration: it invalidates the Stage B cache, requires re-running the golden test vectors, and must be tracked in a decision log. Changes are governed by a **Canon Constitution** — a versioning and change governance spec. The Canon Constitution defines who can propose changes, who approves them, and what triggers a version bump.

### Prototype vs V0

Two distinct build targets:

- **Prototype:** No authentication. Scarcity always relaxed (unlimited readings). No dashboard. No calibration sprint. Proves the pipeline works.
- **V0:** Authentication (Firebase or off-the-shelf). Scarcity feature-flagged (strict = 1 reading/day, relaxed = friend testing). Calibration dashboard. Golden test vector sprint. Full telemetry. This is where real calibration begins.

### Warm no

Three types of "warm no" (system declines to give a reading):

1. **Scarcity:** "Today's reading is still with you. Come back tomorrow." (strict mode, one reading per day)
2. **Abstain:** "I don't have enough to work with." (MatchScore below Abstain threshold)
3. **Incomplete spread:** Partial pipeline failure

---

## Your Research Questions

You are the Head of Product. You own the product definition, the governance workflow, and the calibration dashboard requirements. Answer the following questions in as much concrete detail as possible.

**1. V0 Definition of Done**

What are the measurable criteria for V0 to be considered complete? Define across three dimensions:

- **Calibration quality:** What MatchScore reliability curve target does the product need to reach before V0 ships? The calibration target is "≥70% appropriate at Commit band" — but what does the reliability _curve_ look like, and what is the minimum acceptable shape (i.e., is Exploratory band quality also gated)?
- **System correctness:** What determinism test pass rate is required? The CI pipeline runs the same transcript twice and asserts output identity — what is the pass threshold?
- **Ritual integrity:** How do you verify that warm no, stalker card recurrence, and voice constraints (no predictive language, interiority-first, exactly one anchor) are implemented correctly? What does a ritual integrity checklist look like at ship time?

**2. Canon Constitution operationalization**

The Canon Constitution governs ontology changes. What does this look like as an operational workflow for a small team?

- Who can propose an ontology change (card coordinate adjustment, domain bucket reassignment, system prompt edit)?
- What is the review and approval chain?
- What triggers a version bump vs. a hotfix vs. a rejected change?
- What happens to in-flight sessions when a version bump occurs?
- What is the minimum viable process — something a 3-person team can run without bureaucratic overhead?

Research: what do similar governance systems (API versioning, data schema governance, ML model versioning) use at small-team scale?

**3. Calibration dashboard requirements**

The calibration dashboard is used by the product team to evaluate whether the system is working. It must support three decisions:

- Are MatchScore thresholds correctly calibrated? (Is the Commit band actually high-confidence?)
- Is the hollow flag rate acceptable? (Are Commit-band readings non-hollow?)
- Is the MajorScore tier distribution matching the intended life-scale mapping? (Is Tier 3 rare enough to be meaningful?)

What does this dashboard need to show? What are the exact views, metrics, and filters a small calibration team needs? Who uses it and on what cadence? What is the minimum viable dashboard for a team of 2–3 that doesn't require a dedicated data engineer?

**4. Decision log structure**

You own the decision log that keeps governance choices legible over time. What is the minimum viable decision log format?

- What decisions must be logged (ontology versions, threshold changes, data posture transitions, Canon Constitution amendments)?
- What fields does each log entry need?
- What tooling supports this for a small team (markdown files in a repo, a lightweight database, a structured spreadsheet)?
- How does the decision log interact with the ontology version ID stamped on every session?

Research: what decision log formats work well for small ML/AI product teams?

---

## Output format

For each question, provide:

1. A concrete recommendation or answer
2. The reasoning behind it
3. Any unresolved tradeoffs or choices the team must make
4. If applicable: research pointers, prior art, or analogous systems worth studying

# V0 Definition of Done

**Calibration quality:** For V0 we must hit our 70% appropriateness target **in the Commit band (MatchScore ≥ 0.65)**. In practice, this means the reliability (calibration) curve – which plots actual success rate versus predicted confidence【28†L188-L197】 – should show that at high scores (Commit band) ≥70% of readings are judged appropriate. We would calibrate the MatchScore threshold so that the **commit band (≥0.65)** yields ≥70% correct readings on our golden test transcripts. In contrast, Exploratory-band outputs (0.40–0.64) can have a lower bar (e.g. ~50–60% “appropriate” may be acceptable initially), since they are by nature more uncertain. Crucially, the curve must be monotonic: higher MatchScore should never correspond to _lower_ quality. As a rule, the Commit-band precision should exceed any lower band, and ideally approach ~80% or more, showing confidence aligns with quality. (For reference, a calibration curve plots predicted probability vs actual correctness【28†L188-L197】.) The **minimum acceptable shape** is that Commit-band performance sits at or above the 70% line, with no inverted segments. We do _not_ gate on Exploratory-band at V0 (i.e. we won’t hold Exploratory to 70%), but we should monitor it. If Exploratory quality falls too far below, we may tighten thresholds. In summary: **calibration criterion**: Commit-band reliability ≥70%, reliability curve reasonably well-calibrated (no major dips), and Commit > Exploratory > Abstain in expected order.

**System correctness (determinism):** Because our pipeline is (mostly) deterministic – e.g. Stage A uses LLM at temperature=0 – we require an extremely high pass rate on the CI determinism test (running the same transcript twice). In practice, we should aim for **≳99.9–100%** identical outputs. Any randomness (floating‐point, threading, or non-seeded operations) must be eliminated or documented. In production ML practice, reproducibility is critical: “if someone runs your pipeline twice on the same machine, it should yield effectively the same model (or metrics)”【40†L377-L384】. For our use case, even minor differences (e.g. tiny prompt rewordings, confidence variance) could undermine trust and calibration. Thus the **pass threshold** should be essentially 100%, with zero-tolerance for unexplained drift. If full bitwise reproducibility proves impossible (some GPU ops, etc.), we must at least guarantee statistically identical outputs. In summary: set random seeds and deterministic modes wherever possible【40†L356-L365】, and require the CI identity-check to pass virtually 100% of the time before shipping V0.

**Ritual integrity checklist:** At ship time we must verify all the “ritual” rules are enforced. The checklist includes:

- **Warm no triggers:** Confirm each of the three “decline” cases produces the correct message. For _scarcity_, attempt a second reading in a strict mode and ensure the response is the “come back tomorrow” message. For _abstain_, feed an ultra-ambiguous or empty transcript (forcing MatchScore < 0.40) and check the system replies “I don’t have enough to work with.” For _incomplete spread_, simulate a pipeline failure (e.g. drop a Stage-A result) and verify an “unable to read” message. Each must be explicitly coded and tested.

- **Stalker‐card recurrence:** Ensure no single card dominates. Statistically analyze a batch of transcripts (golden test or random sample) and confirm the frequency of any one card is low (e.g. no card appears in >X% of readings). If one card “stalks” many users (as in tarot lore【24†L39-L47】), we must adjust card weights or selection randomness. Practically, we’ll flag any card whose occurrence is disproportionate and iterate the Stage A feature weights or cosine targets. The goal is a reasonably balanced distribution across the 18 cards.

- **Voice/Language constraints:** Ensure every reading obeys the reflective, interiority-first style. In practice we will run automated checks and spot reviews on sample outputs. Key checks include:
  - **No predictive language:** Scan generated readings for disallowed terms or patterns (future-tense verbs, “will,” “must,” definitive outcomes, dates/timelines). For example, the design docs explicitly forbid phrases like “you will succeed”【22†L94-L100】. We can implement a script that flags “will”, “must”, or years/dates, similar to recommended “post-generation filters”【22†L94-L100】. Any flagged sentence must be rewritten in conditional/reflective tone.
  - **Interiority-first framing:** Confirm the reading focuses on the querent’s feelings and patterns, not external events. For instance, each section should invite introspection (“Where do you notice this pattern in your life?”) rather than state facts. We might check that each reading uses second person and invites self-inquiry (e.g. presence of “you” and questions). (While hard to automate fully, we can spot-check with rules: the first sentence of each card’s interpretation must mention the querent’s current state or past event, not predict the future.)
  - **One anchor per spread:** Each reading must include exactly one concrete sensory or somatic anchor (as specified). For example, we expect prompts like “What color, texture, or temperature comes to mind?” or “Where do you feel this in your body?”【22†L58-L66】. We can enforce this by checking that each reading contains at least one of these cues. Optionally, a simple NLP rule could count occurrences of known sensory terms. (We ensure exactly one by design of our Stage B prompts: the system is instructed to include one unique anchor question per reading.)
  - **Consistency and positivity:** Check no reading contains negative/shaming language or multiple anchors. Each must end with a constructive, low-barrier action (“pause and breathe” style). This too can be partially automated by scanning for negative sentiment or multiple “you should” phrases and confirming none occur.

Each checklist item should pass automated tests or documented manual reviews on the golden set. In summary, the **ritual integrity** verification includes unit tests for warm-no logic, frequency analysis for cards, and text-scanning filters for language constraints (leveraging principles from reflective tarot AI【22†L94-L100】【22†L58-L66】).

_Trade-offs:_ Setting Commit threshold high protects quality but reduces yield. Requiring full determinism may limit use of certain ML features. Enforcing exactly one anchor is rigid (creative writers might like more variety) but aligns with design. We balance by focusing on Commit-band reliability and leaving Exploratory looser for V0; and allowing limited randomness only if it doesn’t breach determinism checks.

**Sources:** Calibration curves and confidence concepts【28†L188-L197】; ML reproducibility best practices【40†L356-L365】【40†L377-L384】; AI tarot writing guidelines for language style【22†L94-L100】【22†L58-L66】.

# Canon Constitution: Governance Workflow

**Proposals:** Any core team member (Product Owner, ML Engineer, Tarot Expert, or Tech Lead) can propose an ontology change. In practice, changes would be submitted as a documented issue or pull request in our repo. For example, if we want to adjust a card’s coordinate or reassign a domain bucket, the proposer writes a short rationale (reference data or user feedback) and suggests the modification. This is akin to how open-source projects use pull requests: all team members may comment and refine the proposal.

**Review and approval:** To keep it lightweight for a ~3-person team, we suggest a _two-person rule_ for approval. Specifically, at least two roles must sign off: e.g. the Product Owner **and** an ML/technical lead (or Tarot domain specialist). These two represent user and technical perspectives. They review the change’s impact on users and on Stage A/B pipeline. If agreed, one of them merges the change. Informally, this could happen in a short meeting or via comments – not a large governance board. The key is _transparency and consensus_, not bureaucracy.

**Version bump vs. hotfix vs. reject:** We should define in the Canon Constitution which changes trigger a full version bump: any change to card coordinates, domain buckets, or the Stage-A similarity weights warrants a **new ontology version** (because these affect which cards get chosen and how Stage B interprets spread). Similarly, changes to core prompts that influence interpretation structure (e.g. altering the Past/Present/Future framing) should bump the version. A **hotfix** (with no version change) is reserved for minor edits that do not alter semantics – e.g. fixing a typo in a system message, or clarifying a user-facing string, _provided_ it does not require rerunning Stage B or re-calibrating. If a change is proposed that contradicts our established design (“Canon”), we reject or defer it; reasons are logged (see Q4).

**In-flight sessions:** Every reading generated should record the current ontology version ID. When we bump the ontology (e.g. to v0.2.0), we ensure new sessions use v0.2.0. In-flight sessions (already past Stage A) will either complete with their old version or be gracefully restarted. For simplicity, we can freeze Stage-B outputs: i.e. a session started under version v0.1.0 finishes under that schema. Essentially, ontology versioning here parallels API versioning: new calls hit the new “endpoint,” while ongoing “calls” finish under the old one【31†L0-L11】. After bumping, we invalidate old Stage B cache (as noted), but don’t retroactively retest old transcripts – we consider vX final once published. The session records let us trace any reading back to the ontology definitions that were live at its start.

**Minimum viable process:** For our small team, we’d keep process simple:

- **Documentation:** Maintain a “Canon Constitution” doc (possibly in the repo) that outlines the governance roles and triggers. This need not be fancy – even a Markdown section in our README or Wiki will do.
- **Propose via issue/PR:** Each change goes through a Pull Request. The PR describes the change, the rationale, and any needed adjustment (golden tests rerun, etc.).
- **Review by two:** Two colleagues (as above) review and either approve or request changes.
- **Version tagging:** If approved as a version bump, the merger script tags the ontology version (e.g. v0.2.0) and triggers reruns of all golden-test transcripts. For hotfixes, we merge without tag and only rerun necessary checks (e.g. changed prompt).
- **Release notes:** Short note in the repo log (or release tag notes) summarizing the change.

This is analogous to **semantic versioning** in APIs or data schemas: major (breaking) changes bump X, minor changes bump Y, patches bump Z【7†L13-L21】. Here, any change that “breaks” Stage-B consistency (requiring new readings) is major. Minor clarifications are patches. By linking ontology version tags to deployments, we keep accountability.

_Trade-offs:_ A heavier governance (e.g. full review board) would slow us; too lax (one-person sign-off) risks mistakes. We choose the middle: consensus of two. Hotfixes allow agility for trivial fixes, at the risk of some inconsistency (users might not get “updated” readings until vX release). But given our user base is small during testing, that risk is low. Logging everything (see Q4) mitigates drift.

_Analogies:_ This model mirrors **API versioning best practices**【7†L13-L21】 and **schema evolution**: minor edits vs. breaking changes. In small ML teams, it resembles model versioning with tags in Git (see standard ML versioning guides). The key idea is: changes to the ontology are tracked like code changes, with approvals and a clear semantic version.

# Calibration Dashboard Requirements

**Views and metrics:** The dashboard should expose the key calibration and quality signals. Specifically:

- **MatchScore distribution by band:** A histogram or bar chart of transcripts (or readings) in Commit, Exploratory, and Abstain bands. This shows how many readings fall into each confidence tier.

- **Band accuracy (reliability):** A view comparing predicted band vs human-rated “appropriate” percentage. For example, plot the measured percent-appropriate for Commit vs Exploratory (using golden-test or sampled user surveys). We should see Commit ≳70% (by definition) and Exploratory lower. This confirms the Commit band is “high confidence.”

- **Threshold sensitivity:** Perhaps a tunable slider or chart showing how the Commit/Exploratory split changes with MatchScore threshold. This is more advanced, but minimally we should list the actual threshold and any experiments justifying it.

- **Hollow flag rate:** A metric chart of the fraction of Commit-band readings flagged hollow (per week or batch). Ideally this stays well below 50% (otherwise it fails our definition). We can show the hollow % over time or by domain to catch any spikes.

- **MajorScore tier distribution:** A breakdown (pie or bar) of readings by number of Major Arcana cards (Tier 0/1/2/3). For example, % with no Majors (Minor-only), % with 1 Major, 2 Majors, 3 Majors. We expect Tier 3 to be very rare (perhaps <5%). This confirms our mapping from threshold to life-scale.

- **Card usage frequencies:** Optionally, a chart of how often each card is selected (to catch any “stalker” bias). If one card far exceeds others, that flags an issue (see Q1).

**Filters and segmentation:** Because the product team is small, we don’t need an overly complex BI tool, but some filtering helps:

- Filter by **domain bucket** (Foundation, Motion, etc.) to see if some domains dominate Commit vs Exploratory.
- Filter by **transcript type** (from golden set: clear vs ambiguous vs noise vs adversarial). We can tag golden transcripts by category; the dashboard can then show metrics per category (this helps verify we hit Ambiguous ~50% commit, etc.).
- Date filter to monitor trends.
- Possibly filter by **user cohort** or test vs production data if applicable (though initial use is limited).

**Users and cadence:** The primary users are the **Product Owner and ML Engineer**, with occasional input from the designers or tarot expert (for interpreting hollowness or card meaning). They would check the dashboard weekly or after each calibration sprint. For example, during calibration testing we’d run golden cases and immediately review the dashboard to decide if thresholds need tweaking or if any corrective action (like filtering hollow outputs) is needed. It’s not a public dashboard; it’s an internal tool.

**Minimum viable implementation:** We do not need a full-time data engineer. A simple solution is to log each reading event (including MatchScore, major count, hollow flag, etc.) to a spreadsheet or lightweight database (e.g. Google Sheets, Airtable, or a CSV). Then use a dashboard tool like Metabase, Redash, or even Google Data Studio to create live charts. Alternatively, a Jupyter notebook with static plots updated per sprint could suffice. The key is ease of updating: e.g. dumping the latest golden test results into the sheet and hitting “refresh.” For V0, it’s fine if humans export some metrics manually to a Google Sheet with charts.

**Summary of views:** In practice, the dashboard might have tabs or sections:

- _Confidence:_ showing matchscore distribution and band accuracy (commit vs exploratory appropriateness).
- _Hollow:_ showing hollow flag % and examples (maybe top hollow transcripts).
- _Major Arcana:_ showing tier distribution.
- _Quality over Time:_ tracking commit-band appropriateness and hollow rate across builds.

_Trade-offs:_ A highly interactive dashboard (filterable UI) is nice but takes setup. A simpler static report (e.g. weekly PDF or notebook) wastes less time. Given small team, start with the simplest: perhaps a shared Google Sheets with formulas and charts (no coding). Once processes stabilize, we could move to Metabase or the like if desired. The “minimum viable” is to at least have compiled metrics in one place (even if offline review): e.g. a Markdown report with embedded charts.

**Analogy:** This is like standard **ML monitoring**: tracking confidence calibration and drift【14†L1-L7】. It’s similar to performance dashboards in MLOps products – but simplified. The critical insight is to enable quick go/no-go calibration decisions, not to please fancy dashboard aesthetics.

# Decision Log Structure

**Logged decisions:** We log any governance decision that affects system behavior. Key examples:

- **Ontology version changes:** Every time we bump (or branch for hotfix) the ontology, log the version ID and what changed (which cards, prompts, etc.).
- **Threshold adjustments:** If MatchScore or MajorScore cutoffs change, note the new values and why (e.g. “raised commit threshold to 0.65 to hit 70% appropriateness”).
- **Data/posture transitions:** If we change the mix of transcripts (e.g. add a new category to golden set, or alter data preprocessing rules), record it.
- **Constitution amendments:** Any change to the governance process itself (like altering who can approve) should be logged too, although less frequent.
- Essentially: any choice that “would be hard to remember” or that “affects behavior, risk, or quality”【12†L13-L21】 gets logged.

**Log entry fields:** Each entry should minimally include:

1. **Date** of decision.
2. **Decision Title/ID:** A short summary (e.g. “v0.2.0: Add Chariot reversed”).
3. **Context/Description:** A few lines: “We changed X to Y because Z.” (Inkblot recommends “We chose X over Y because Z.”【39†L294-L302】.)
4. **Authors/Approvers:** Who made the decision (for accountability).
5. **Link/Reference:** A link to any relevant artifact (GitHub PR, issue, meeting note, PRM issue).
6. **Impact:** If applicable, note what components are affected (Stage A, Stage B prompts, golden tests to rerun, etc.) and version stamping details.
7. **Decision type:** (Optional tag: ontology, threshold, process, etc.)

Using a consistent template makes it easy to scan. We can base it on the ADR (Architecture Decision Record) style or the Inkblot “bullet” style【39†L294-L302】. For example, an entry might read:

```
- *2026-02-15:* Ontology v0.2.0 – Adjust Stability/Volatility axis weight for The Tower in S-tier. Approved by PM+Lead. (Link to PR #123). Reason: Golden-test showed Tower too rarely selected in disruptive transcripts.
```

This includes date, decision, and rationale in one line, with link.

**Tooling:** For a 3-person team, the simplest is **Markdown files in our code repo**. We can have a `DECISION_LOG.md` where each line or bullet is an entry【39†L294-L302】. This lives alongside our ontology files (echoing Tran’s advice to keep docs near the code【12†L21-L23】). Every PR that makes a decision would also add a bullet to `DECISION_LOG.md`. Alternatively, a shared Google Doc or Notion page could work, but that risks divergence from code. A spreadsheet (with columns) is also possible, but less ideal for traceability. So Markdown in Git is preferred: it’s versioned, searchable, and easily linked to code changes.

**Version stamping:** Because every session records the ontology version, we can tie readings back to decisions. For example, if a user’s session says “ontology v0.2.0,” we know exactly which entries in the log were in effect. The decision log should mention the version number for changes that bump it. This way, if we later ask “why did we interpret the Moon as we did on Feb 20?”, we find the log entry where Moon’s card coordinate was last changed (and the version). In this sense, the decision log and ontology version tags work like a “bill of materials” for each reading.

_Trade-offs:_ Keeping the log **lightweight** is important. We should _not_ log every trivial discussion or minor meeting note. Only decisions that affect the product’s behavior or design should go in. As Inkblot warns, don’t let it become meeting minutes【39†L294-L302】. Also, Markdown is easy but not as structured as a database; however, for 3 people it’s more than sufficient and no one has to maintain a DB schema. We accept the minor loss of machine-queryability in exchange for simplicity and transparency.

_Pointers:_ This is essentially **Architecture Decision Records (ADRs)** in practice – capturing the “why” of each choice【39†L294-L302】【12†L21-L23】. Well-known ADR templates (e.g. on GitHub) can be a model. The Inkblot example is a concise guide to the format【39†L294-L302】. The Tran governance guide explicitly recommends a running decision log in the code repo, logging only impactful choices【12†L21-L23】. We’ll follow that pattern.
