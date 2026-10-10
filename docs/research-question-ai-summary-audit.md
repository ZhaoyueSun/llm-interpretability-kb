# Research Question × AI Summary Audit

Status: working draft; findings only, no RQ records changed
Updated: 2026-10-10
Scope: all 123 papers in `data/corpus.yaml`

## Purpose and method

This audit compares the paper-level RQ in
`docs/research-question-timeline-draft.md` with the `Research Question / 研究问题`
section of each paper's bilingual `ai_summary`. The comparison asks whether both texts
identify the same unknown, scope, and central claim. Differences in wording or detail are
not treated as errors.

All 123 paper records and all 123 timeline entries were matched by `paper_id`. Because the
AI summaries were generated with reference to the earlier RQ review, agreement between the
two texts is not independent confirmation. Papers were therefore sent to full-text review
when either text:

- added or omitted a central unknown;
- promoted a method, experiment, or secondary analysis into the main RQ;
- used stronger epistemic language than the paper;
- conflicted with the paper's current normalized RQ or primary graph assignment.

Full-text checking used the read-only Docling Markdown in PaperKnowledgeBase. Evidence
below records the stable `paper_id`, section, and current Docling line numbers rather than
copying full text into this repository.

## Result overview

- 115 papers: no material disagreement found between the paper-level RQ and AI Summary RQ.
- 8 papers: retained below for correction or user review.
- The main failure mode is not initial paper-level extraction. It is the later normalization,
  merging, and assignment of papers to RQ families or nodes.
- No existing RQ, graph edge, or paper assignment has been changed by this audit.

## High-confidence issues

### 1. `p_2017_lundberg_a_unified_approach`

**Finding:** The paper-level RQ is substantially correct, but the AI Summary calls the
axioms properties of a “faithful” additive explanation. The paper calls them desirable
properties defining a unique additive feature-attribution solution; it does not establish
model-mechanism faithfulness. The graph also places the paper under `evidential-standards`,
which confuses definition axioms with evidence for trusting an explanation.

**Full-text evidence:** Abstract, Docling line 17; Sections 2–4, especially lines 86–120.
The paper's central claims are unification, uniqueness under three properties, and
approximation of the resulting attribution quantity.

**Recommended correction:**

- replace “可信的加性解释应满足哪些公理” in the AI Summary with “加性特征归因应满足哪些理想性质”;
- move the normalized RQ out of `evidential-standards` into a proposed
  `explanation-definition-construction` family;
- keep the 2017 paper in a definition/axiomatization RQ separate from FastSHAP.

### 2. `p_2021_jethani_fastshap_real_time_shapley`

**Finding:** Its paper-level RQ and AI Summary agree, but the graph incorrectly merges it
with the 2017 SHAP definition question. FastSHAP accepts the Shapley target and asks how to
estimate it in real time through amortized learning. Answering this does not answer which
attribution rule should be defined or why.

**Full-text evidence:** Abstract and introduction, Docling lines 15 and 23–33; conclusion,
line 244. These passages consistently frame the unknown as efficient, amortized estimation.

**Recommended correction:** Create a separate normalized RQ such as “How can Shapley
attributions be approximated accurately in a single forward pass?” and connect the 2017
definition node to it with a scaling or extension edge.

### 3. `p_2022_achtibat_from_attribution_maps`

**Finding:** The paper-level RQ is correct, but its primary graph family is wrong. The paper
constructs a concept-level explanation that combines local and global XAI; it does not ask
what evidence is sufficient to trust an interpretability claim.

**Full-text evidence:** Abstract, Docling line 21; introduction, lines 27–45. The recurring
contrast is between the “where” supplied by local attribution and the “what” supplied by
global concept analysis.

**Recommended correction:** Move the node from `evidential-standards` to the proposed
`explanation-definition-construction` family. Its question should remain separate from
faithfulness or causal-validation questions.

### 4. `p_2022_olsson_in_context_learning`

**Finding:** The paper-level RQ and AI Summary agree, but the graph's primary assignment to
`rq-circuit-formation` overweights one source of evidence. The paper's central hypothesis is
that induction heads may implement most in-context learning; observing their formation at a
training phase change is the primary evidential strategy, not the whole research question.

**Full-text evidence:** Abstract, Docling line 9; introduction, lines 21–34. The paper labels
the phase change as the “primary way” it obtains evidence for the broader mechanistic claim.

**Recommended correction:** Give the paper a primary assignment to a behavior-mechanism RQ
about whether induction heads implement in-context learning. Retain `rq-circuit-formation`
as a related RQ supported by its checkpoint analysis.

### 5. `p_2025_viswanathan_the_intrinsic_dimension`

**Finding:** The paper-level RQ and AI Summary agree, but the graph assigns the paper to
`rq-causal-representation-geometry`, whose question concerns causally meaningful semantic
directions or subspaces. This paper studies the intrinsic dimension of a prompt's token
point cloud, its correlation with uncertainty, and its usefulness for pre-output screening;
it does not establish a causal semantic direction or subspace.

**Full-text evidence:** Abstract, Docling line 19; introduction, lines 23–38. The stated
contributions are prompt-level intrinsic dimension, correlation with average surprisal,
and a malicious-prompt classifier.

**Recommended correction:** Create a distinct normalized RQ such as “Can prompt-level token
geometry reveal uncertainty and support monitoring before generation?” It belongs under
representation form or a future monitoring/evaluation family, not the present causal-
geometry node.

### 6. `p_2026_filus_measuring_monosemanticity_in`

**Finding:** The paper-level RQ and AI Summary agree, but its primary assignment to
`rq-method-usefulness` is too broad and changes the unknown. The paper asks how
monosemanticity should be operationalized without labels or an external embedding model;
concept deletion is validation of the metric, not the main question of whether SAEs are
generally useful.

**Full-text evidence:** Abstract, Docling line 11; introduction, lines 17–21 and 27. The
paper explicitly identifies the lack of consensus on defining and measuring
monosemanticity and introduces the Tversky Monosemanticity Score in response.

**Recommended correction:** Create a separate RQ such as “How can SAE latent
monosemanticity be measured without concept labels or external embedding geometry?” Its
relation to method usefulness should be secondary or an evaluation edge.

## Medium-confidence emphasis issues

### 7. `p_2025_galichin_i_have_covered`

**Finding:** The existing paper-level RQ is supported by the text, but the primary graph
assignment to `rq-posttraining-mechanism-change` may overstate a secondary subquestion. The
paper explicitly introduces its central question as how reasoning capabilities are encoded,
then asks whether SAE features for uncertainty, exploration, and reflection can be found and
causally steered. Stage-wise emergence after reasoning fine-tuning is one contribution.

**Full-text evidence:** Introduction, Docling lines 29 and 35–43; stage-wise analysis,
lines 194–207. The latter supports a temporal relation but does not replace the broader
representation-and-control question.

**Recommended correction:** Review whether the paper needs a primary RQ about sparse
representations of reasoning states, with `rq-posttraining-mechanism-change` retained as a
related assignment. No paper-level RQ rewrite is required unless the graph is restructured.

### 8. `p_2025_tian_why_representation_engineering`

**Finding:** The old RQ is broadly consistent with the AI Summary and original, but its
examples of honesty and fairness can read as if they were all central experimental targets.
The paper's specific unknown is why high-level representation directions remain stable
across VLM layers and whether they can resist cross-modal misalignment and hallucination.

**Full-text evidence:** Introduction, Docling lines 17–28. Honesty and fairness motivate
the broader RepE program; the paper's own contribution emphasizes VLM transfer, spectral
stability, and multimodal misalignment.

**Recommended correction:** Narrow the paper-level RQ to the stability and cross-modal
effectiveness of representation engineering in VLMs. Its current primary graph assignment
to representation control can remain.

## Implications for the next review pass

The audit suggests three checks should be applied to every normalized node before language
polishing:

1. **Definition versus evidence:** axioms defining an explanation are not evidence that the
   explanation is faithful.
2. **Central question versus evidence strategy:** a training trajectory, intervention, or
   benchmark may support the main claim without being the paper's primary RQ.
3. **Shared topic versus shared unknown:** papers using the same quantity or technique must
   not be merged unless answering one would materially answer the other.

The flagged corrections are proposals only. They should be reviewed node by node before
changing the graph, paper-level RQs, or family model.
