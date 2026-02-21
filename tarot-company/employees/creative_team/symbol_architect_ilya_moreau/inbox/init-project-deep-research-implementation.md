# Deep Research: Implementation Questions (V0)

1. What are the exact 18 cards — names, arcana type, and preliminary polarity vectors?
2. What are the proposed MajorScore thresholds for intensity and scope — what numeric values trigger Major Arcana eligibility?
3. How do you verify the deck is sufficiently dispersed across the six-dimensional polarity space — what is the test?
4. What is the cosine similarity weighting table — exact weights for polarity axes, scope, intensity, and agency?
5. How are the 5 domain buckets defined operationally — what signals in transcript text map to each?
6. For the 6 Major Arcana, do they occupy all six extreme regions, or do they cluster in particular axes?
7. What is the minimum cosine distance between any two cards in the MVP deck to prevent symbolic collapse?
8. How do themes (5–8 keywords per card) get generated — author-defined, or derived from the polarity vector?
9. What is the exact Stage A prompt structure — what does it receive, and what JSON format does it return?
10. What test transcripts will validate Stage A produces sensible feature vectors — what are the edge cases?

# Design Constraints and Requirements

Our goal is to create an 18‑card “polarity deck” covering a **six-dimensional polarity space**. The deck includes six _Major Arcana_ (one per dimension) and 12 _Minor Arcana_ (mixed polarities). By analogy to other design or divination decks, each card should have a clear archetypal name and vector to capture its meaning【18†L280-L288】. For example, prior work shows how speculative “tarot” decks use evocative titles to reflect values (e.g. the Tarot Cards of Tech)【18†L280-L288】. Here we enumerate a plausible set of cards, noting that no public source lists an official set. We propose the following **example** lineup (names and axes are illustrative):

- **Major Arcana (6 cards)** – one per axis, representing extreme polarities: e.g. _Visionary_, _Guardian_, _Innovator_, _Mediator_, _Architect_, _Catalyst_. (Each is **Major**, with a high intensity and scope score.)
- **Minor Arcana (12 cards)** – mixed-focus cards combining axes, with moderate intensity: e.g. _Balance_, _Conflict_, _Curiosity_, _Empathy_, _Structure_, _Change_, _Insight_, _Collaboration_, _Persistence_, _Renewal_, _Adaptation_, _Integrity_. (Each is **Minor**, with lower intensity than Majors.)

Each card would have a preliminary 6‑component _polarity vector_ (values in, say, –1 to +1) placing it in the 6D space. For example, a Major card on axis 1 might be `[+0.9, 0, 0, 0, 0, 0]` (emphasizing the first polarity) while a Minor mixing axes 1 and 2 might be `[+0.6,+0.6,0,0,0,0]`, etc. These values are designer choices and can be adjusted later. (Such a high-dimensional scheme is akin to word embeddings: similar conceptually to how “Success” and “Achieve” have similar numeric vectors in word2vec【54†L73-L81】.)

# MajorScore Calculation and Thresholds

We define a _MajorScore_ based on a card’s **intensity** and **scope**. For example, one could compute `MajorScore = α·Intensity + β·Scope`, or even a product, reflecting that Majors should be high in both. A reasonable approach is to set numeric thresholds (tuned by trial) so that only the most extreme cards become Major Arcana. In practice, thresholds are often determined empirically. For instance, cosine‑similarity based retrieval systems typically use cutoffs in the 0.7–0.9 range【22†L19-L22】. Analogously, we might require intensity ≥0.8 and scope ≥0.7 (on a 0–1 scale) for _Major_ status, but useheld‑out examples to calibrate the exact values. (Different tasks demand different thresholds【22†L19-L22】.) In short, pick a high cutoff so that roughly six cards exceed it. As an example, one might set *MajorScore*≥1.6 (if normalized) as the rule, which given typical scoring would select only the top 6.

# Dispersion in 6D Polarity Space

To ensure the deck covers the space without clustering, we must **test dispersion**. A practical approach is to compute all pairwise cosine distances among the 18 card vectors and analyze their distribution. For good coverage, distances should be relatively large and varied. One can use cluster metrics (e.g. silhouette score) or distribution tests like Maximum Mean Discrepancy (MMD) to check uniformity【47†L458-L467】. In essence, we want **no two cards too close**. For example, if many card vectors cluster together, the silhouette score would drop (indicating poor separation). We could also perform a uniformity test (Ripley’s K-function or simply histogram of distances) to verify no regions of the 6D cube are empty.

In practice, a simple rule is to **ensure minimum distances exceed a threshold** (see next section). We might also visualize a 2D PCA or t-SNE plot of the cards to manually confirm spread. In summary, the deck passes the dispersion test if the six Major cards are at or near the six extreme “corners” (one per axis) and the 12 Minor cards fill in between, without tight clusters. (Using techniques like MMD or the methods above is analogous to how embedding spaces are evaluated for diversity【47†L458-L467】.)

# Cosine Similarity Weighting Table

When combining polarities and other signals (scope, intensity, agency), we assign fixed **weights**. For example, suppose we have 6 polarity axes (A–F), plus scope (S), intensity (I), and agency (Ag). We then pick weights that sum to 1 (for normalization). An illustrative table might be:

- Axis A weight: 0.12
- Axis B weight: 0.12
- Axis C weight: 0.12
- Axis D weight: 0.12
- Axis E weight: 0.12
- Axis F weight: 0.12 (these sum to 0.72)
- Scope (S) weight: 0.10
- Intensity (I) weight: 0.10
- Agency (Ag) weight: 0.06

(Each signal should be normalized before weighting【50†L7-L10】.) These numbers are adjustable. In effect, a combined **cosine score** for a transcript vector _v_ vs. a card vector _c_ could be computed as the weighted sum of their per-axis cosine similarities (plus perhaps dot-product on scope/intensity). Using weighted combinations is a standard practice (each component normalized first【50†L7-L10】). For instance, we might use a transform on raw cosine values to [0,1] then do `score = 0.12·cos(A) + … + 0.06·cos(Ag)`. Fine‑tuning these weights should be guided by validation results: emphasize axes that are more important, but ensure no single axis dominates.

# Domain Buckets and Transcript Signals

We assume **5 broad domain buckets** for classifying transcripts. (For example, one might use _Technical_, _Strategic_, _Emotional_, _Personal_, and _Analytical_ domains.) Each bucket is defined by lexical and contextual cues in the text. In practice, we can map transcripts to domains via keyword spotting, lexical patterns, or simple classifiers. For instance:

- **Technical/Analytical** – presence of jargon, numbers, logic terms (e.g. “algorithm”, “analysis”, “data”) suggests the _Technical_ bucket.
- **Strategic/Planning** – forward‑looking language (e.g. “goals”, “strategy”, “future”) hints at _Strategic_ domain.
- **Emotional/Interpersonal** – emotional adjectives or empathy words (e.g. “feel”, “love”, “frustrated”, “support”) indicate _Emotional/Personal_.
- **Procedural/Instructional** – imperative verbs or steps (e.g. “must”, “should”, “next step”) signal a _Task/Procedural_ category.
- **Creative/Exploratory** – open‑ended, creative terms (e.g. “imagine”, “idea”, “possible”) suggest a _Creative_ bucket.

These are examples; actual buckets depend on the project’s focus. **Signals in text** such as keywords, verb tenses, pronouns, or discourse markers can map utterances to buckets【35†L49-L57】. For example, Jurafsky _et al._ note that simple words like _“yeah/okay”_ serve as cues for dialog acts【35†L49-L57】 – similarly, we can predefine lexicons per domain. A transcript would be checked for these signals to assign it (or parts of it) to one of the five domains.

# Distribution of Major Arcana

In our design, the 6 Major Arcana are placed at the extreme ends of each of the six polarity dimensions (one card per axis). This means **each major card dominates one axis**. They do not cluster on a subset of axes, but instead each provides maximal contrast on its own axis. (This maximizes coverage of the space and prevents redundancy.) In other words, Major Arcana are evenly distributed: one card with vector `[~1,0,0,0,0,0]`, another `[0,~1,0,0,0,0]`, etc. This ensures the six extremes are occupied. If instead multiple Majors were similar, they would cluster, which would reduce diversity. Distributing them like this follows best practice for diversity in representation【47†L458-L467】.

# Minimum Cosine Distance (Symbolic Collapse)

To prevent _symbolic collapse_ (two cards becoming effectively indistinguishable), we require a **minimum pairwise distance**. Concretely, we enforce that the cosine similarity between any two _distinct_ card vectors stays below a high threshold. In practice, similarity thresholds around **0.7–0.8** (i.e. distance ≥0.2–0.3) are common cutoffs for “not too similar”【22†L19-L22】. For instance, many applications use ~0.79 as a rule-of-thumb threshold for considering texts “similar enough”【22†L19-L22】. Here we flip it: we want card–card similarity **below** ~0.8. Thus, we could require `cosine(card_i, card_j) ≤ 0.8` for all i≠j. This ensures each card is distinct. (Alternatively, one might ensure _distance_ (1–cosine) ≥0.2.) These values can be tuned, but citing embedding practice, a threshold around 0.7–0.9 is typical【22†L19-L22】. In summary: pick a low maximum similarity (high minimum distance) so that no two cards are nearer than this bound.

# Theme Generation (Keywords)

Each card carries 5–8 _theme keywords_ summarizing its core concepts. These themes can be either **author-defined** or **data-derived**. A common approach is for card creators to manually choose salient words (e.g. based on mythology or domain knowledge) that reflect the card’s meaning. Alternatively, themes could be algorithmically derived by finding words whose embeddings are closest to the card’s vector【54†L73-L81】. For example, if a card’s polarity vector is near `[0.8,0.1,…]`, we could take its nearest neighbors in semantic space (as in word embedding k‑NN) to pick relevant keywords. The literature shows that embeddings do capture semantics (e.g. “cup of tea” and “mug of coffee” have closely aligned vectors【54†L73-L81】), so similar reasoning could pick candidate themes. In practice, a hybrid approach works best: experts define core themes, possibly verified or augmented by word‑embedding neighbors for consistency.

# Stage A Prompt and Output Schema

**Stage A** takes as input a single conversation transcript (e.g. a string of dialogue) and returns a JSON with the extracted features. A plausible prompt structure is:

```
System: You are a classifier that reads a transcript and outputs JSON with polarity features.
User: "<Full transcript text here>"
```

The model’s **JSON output** might have fields like:

- `"polarity_vector": [p1,p2,…,p6]` (the six numeric polarities),
- `"intensity": <float>`,
- `"scope": <float>`,
- `"agency": <float>`,
- `"domain_bucket": "<name>"`,
- `"error": "<optional error message>"`.

For example:

```json
{
  "polarity_vector": [0.05, -0.8, 0.33, 0.1, -0.25, 0.47],
  "intensity": 0.76,
  "scope": 0.12,
  "agency": 0.55,
  "domain_bucket": "Technical",
  "error": ""
}
```

Here the prompt feeds the raw transcript text; the model analyzes it and returns the structured JSON. This schema must be precisely defined (all fields with known types) so the system can parse it reliably. In sum, Stage A’s job is to convert free text into a numeric _feature vector_ and metadata in JSON form.

# Validation Test Transcripts

To ensure Stage A works, we should create **test transcripts** that exercise edge cases. Useful scenarios include:

- **Highly Emotional**: e.g. a short rant (“I’m furious and overwhelmed”), to test high intensity/low scope.
- **Technical Jargon**: e.g. a snippet filled with domain terms (“Signal processing in neural nets…”), to test _Technical_ domain bucket.
- **Mixed Content**: e.g. one sentence factual, one emotional (“Sales are up. But we’re so stressed.”), to test balance and mixed polarity.
- **Minimal Content**: e.g. “OK.” or silence, to test default outputs (zero or null).
- **Contradictory Polarity**: e.g. “I love this idea but I’m anxious about it,” to test how competing cues are handled.
- **All High and All Low**: one transcript very positive (`polarity +`) and one very negative, to see if output scales.

Each test transcript should be fed to Stage A and we check that the resulting vectors/fields make sense (e.g. positive transcript yields positive polarity scores, the “anger” one yields high intensity, the technical one hits the tech bucket, etc.). These validation examples help tune and verify the threshold and weighting parameters.

**Sources:** We combined general principles from NLP and embedding literature to shape these answers. For instance, prior work on tarot-inspired design decks and embedding-based classification informed our approach【18†L280-L288】【54†L73-L81】, and practical guidance on cosine thresholds and diversity comes from embedding communities【22†L19-L22】【47†L458-L467】. The dialogue-act cues source【35†L49-L57】 illustrates how simple words signal structure, analogous to our domain-keyword mapping.
