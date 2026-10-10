# Technique taxonomy review v2 (superseded)

> This historical review has been superseded by the approved 123-paper Techniques
> taxonomy in `data/taxonomies/techniques.yaml` and proposal
> `tp_20261009_techniques_v3`. Its counts and external-reference gaps describe the
> earlier 110-paper draft and should not be used as the current data model.

Status: pending proposal (`tp_20261009_techniques_v2`)
Corpus: 110 papers
Sources: project paper records plus the two local PaperKnowledgeBase surveys

## What changed

The first draft had a category error: it treated contribution types such as “training dynamics,” “theory,” and “evaluation” as techniques. V2 classifies **reusable operations**. Each leaf now states what the researcher actually does: fit a probe, project through the unembedding, patch an activation, optimize a circuit mask, search edges with EAP, add a steering direction, compare checkpoints, run a randomization test, and so on.

Every paper receives:

- one primary technique primitive;
- materially used secondary technique primitives;
- separate facets for evidence strength, target object, contribution role, and modality.

This prevents `attention head`, `multimodal`, `theory`, or `evaluation paper` from being mistaken for a technique.

## Technique tree

### 1. Readout and Measurement — 20 primary papers

- Activation Statistics — 2
- Attention Pattern and OV/QK Analysis — secondary method only
- Native Vocabulary Projection — 1
- Learned and Model-Internal Lenses — 3
- Supervised and Sparse Probing — 3
- Unsupervised Contrastive Probing — 1
- Representation Geometry and Subspace Analysis — 6
- Gradient Sensitivity — 1
- Decomposition and Component Attribution — 3

### 2. Feature-Basis Construction — 15

- Concept-Unit Alignment — 2
- Vanilla and Top-K Sparse Autoencoders — 5
- Gated and JumpReLU Sparse Autoencoders — 3
- Specialized and Feature-Aligned Dictionaries — 2
- End-to-End Functional Dictionary Learning — 1
- Subspace-Aware Dictionary Learning — 1
- Cross-Model Feature Alignment and Stitching — 1

### 3. Causal Localization — 14

- Activation Ablation and Replacement — 3
- Activation Patching and Causal Tracing — 5
- Path Patching — 1
- Learned Masks and Gates — 2
- Causal Mediation Analysis — 1
- Interchange Interventions and Distributed Alignment Search — 2

### 4. Circuit and Algorithm Reconstruction — 21

- Hypothesis-Driven Circuit Analysis — 7
- Automated Intervention-Based Circuit Search — 2
- Attribution-Based Edge Search — 3
- Sparse Feature Circuit Discovery — 3
- Circuit Comparison and Universality Testing — 5
- Solver-Checkable Circuit Verification — 1

### 5. Steering and Model Change — 12

- Activation Scaling, Suppression, and Runtime Gating — 2
- Activation Vector Addition and Representation Engineering — 5
- Projection Erasure and Direction Removal — 1
- Logit-Space Steering — 1
- Targeted Parameter Editing and Local Fine-Tuning — 1
- Mechanism Induction and Circuit Construction — 2

### 6. Formal and Temporal Mechanism Analysis — 12

- Controlled Toy-Model Construction — 3
- Checkpoint and Training-Trajectory Analysis — 4
- Analytic Optimization and Training Dynamics — 2
- Causal-Abstraction and Counterfactual Formalism — 2
- Optimization-Landscape Analysis — 1

### 7. Evaluation and Falsification Protocols — 16

- Randomization and Sanity Controls — 1
- Probe Controls and Detectability Analysis — 3
- Intervention Faithfulness and Robustness Tests — 5
- Dictionary Quality and Monosemanticity Metrics — 4
- Controlled Benchmarking and Method Comparison — 3

Primary counts sum to 110. Full primary and secondary assignments are in `data/classification-proposals.yaml`.

## Evidence-strength axis

The taxonomy is not an evidence ranking. A second axis records what a technique can support:

1. **Descriptive** — a pattern or direction exists.
2. **Decodable** — a property can be recovered.
3. **Sensitivity** — a local first-order change affects the metric.
4. **Causal-local** — an intervention changes or restores behavior.
5. **Causal-structural** — components and edges support a mechanism claim.
6. **Formal** — a mathematical or solver-checkable property holds.
7. **Audit** — reliability or utility of another method is measured.

This distinction is essential: a high-accuracy probe, a large activation, an EAP edge score, a successful patch, and a verified circuit are not interchangeable evidence.

## Papers that still do not fit the two source taxonomies

V2 reduces this set from 38 to **32 papers** by placing circuit scaling and causal alignment under concrete operations. These 32 require genuinely new technique leaves.

### Cross-Model Feature Alignment and Stitching (1)

- `p_2025_chen_transferring_linear_features`

### Solver-Checkable Circuit Verification (1)

- `p_2026_somani_towards_verifiable_transformers`

### Mechanism Induction and Circuit Construction (2)

- `p_2021_geiger_inducing_causal_structure`
- `p_2024_draguns_unelicitable_backdoors_in`

### Controlled Toy-Model Construction (3)

- `p_2022_elhage_toy_models_of`
- `p_2022_scherlis_polysemanticity_and_capacity`
- `p_2023_chughtai_a_toy_model`

### Checkpoint and Training-Trajectory Analysis (4)

- `p_2022_olsson_in_context_learning`
- `p_2023_nanda_progress_measures_for`
- `p_2024_prakash_fine_tuning_enhances`
- `p_2024_singh_what_needs_to`

### Analytic Optimization and Training Dynamics (2)

- `p_2023_varma_explaining_grokking_through`
- `p_2024_nichani_how_transformers_learn`

### Causal-Abstraction and Counterfactual Formalism (2)

- `p_2023_geiger_causal_abstraction_a`
- `p_2023_park_the_linear_representation`

### Optimization-Landscape Analysis (1)

- `p_2025_tang_a_unified_theory`

### Randomization and Sanity Controls (1)

- `p_2018_adebayo_sanity_checks_for`

### Probe Controls and Detectability Analysis (3)

- `p_2019_hewitt_designing_and_interpreting`
- `p_2020_ravichander_probing_the_probing`
- `p_2026_hai_when_and_why`

### Intervention Faithfulness and Robustness Tests (5)

- `p_2019_wiegreffe_attention_is_not`
- `p_2023_hase_does_localization_inform`
- `p_2023_zhang_towards_best_practices`
- `p_2026_munigety_from_correlation_to`
- `p_2026_zhou_sparse_visual_thought`

### Dictionary Quality and Monosemanticity Metrics (4)

- `p_2024_chanin_a_is_for`
- `p_2024_makelov_towards_principled_evaluations`
- `p_2025_kantamneni_are_sparse_autoencoders`
- `p_2026_filus_measuring_monosemanticity_in`

### Controlled Benchmarking and Method Comparison (3)

- `p_2024_huang_ravel_evaluating_interpretability`
- `p_2025_mondal_language_specific_neurons`
- `p_2025_wu_axbench_steering_llms`

## Remaining limitations

- Primary assignment is necessarily reductive for pipeline papers such as MechELK, Sparse Feature Circuits, and Counting Circuits; their secondary labels are essential.
- Abstracts and survey descriptions are sufficient for family-level classification, but exact implementation variants should be verified against full methods sections before formal approval.
- SHAP, neural feature learning based on NFM/EGOP, crosscoders, and transcoders remain valid external leaves but have no primary paper in this 110-paper corpus. They should be added only if the taxonomy is intended to cover the field beyond the current corpus.

## Approval boundary

This is still a proposal. No file in `data/taxonomies/` has been changed, and no event has been appended to `data/classification-events.jsonl`.
