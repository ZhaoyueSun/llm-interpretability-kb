# Research Question Family Assignment Audit

Status: audit snapshot; conclusions applied to the working graph on 2026-10-10
Updated: 2026-10-10
Scope: all 123 papers in `data/corpus.yaml`

> Implementation note: after user review, the proposed `Explanation Definition and Construction`
> lane was narrowed and renamed `Mechanism Explanation / 机制解释`. The final working order is
> Representation Form → Computational Mechanism → Mechanism Explanation → Intervention and Control
> → Temporal Development and Learning → Evidential Standards → Generality and Transfer. The `DC`
> notation below is retained only as the label used during this audit pass.

## Audit question

For each paper, this audit first assigns one primary family from the paper-level research
question without using its current graph assignment, and only then compares the result with
`docs/research-question-graph-draft.yaml`. The judgment uses the paper-level RQ, the bilingual
AI summary, and the original introduction/problem statement. Full text was rechecked for
disagreement candidates. A paper may contribute to other families, but the primary family is
the family that contains the paper's central unknown rather than its technique, target object,
application, or evidential strategy.

## Family decision rule

| Code | Family | Central unknown |
|---|---|---|
| ES | Evidential Standards / 证据标准 | What evidence justifies an interpretability claim? |
| RF | Representation Form / 表示形式 | What is represented, and in what structural form? |
| CM | Computational Mechanism / 计算机制 | What internal computation produces the behavior? |
| TD | Temporal Development and Learning / 时间与学习 | How does a representation or mechanism form or change across training, depth, or generation? |
| IC | Intervention and Control / 干预与控制 | Can internal understanding support a predictable, localized change? |
| GT | Generality and Transfer / 泛化与迁移 | Does an explanation or mechanism hold or transfer across regimes? |
| DC | Explanation Definition and Construction / 解释的定义与构造 *(proposed)* | What should an explanation be, and how can it be generated or constructed? |

`DC` is a proposed missing family, not an approved taxonomy change. It is necessary to avoid
calling an explanation-producing algorithm a computational mechanism of the model, or treating
axioms that define an explanation as evidence that the explanation is faithful.

## Result

- 89 papers retain the same primary family.
- 22 papers have a high-confidence family mismatch.
- 12 papers are genuine boundary cases, but the independent judgment still favors a different
  primary family from the current one.
- The proposed `DC` family accounts for 19 of the 34 differences. The other 15 are movements
  among the existing six families.
- Independently assigned totals are: ES 19, RF 33, CM 26, TD 12, IC 8, GT 6, DC 19.

This is a family-level audit only. Agreement in this table does not certify that the current
normalized RQ node is correct. In particular, `p_2025_viswanathan_the_intrinsic_dimension` and
`p_2026_filus_measuring_monosemanticity_in` remain in the right broad family but are attached to
the wrong normalized RQ node; `p_2025_tian_why_representation_engineering` retains its family but
needs narrower paper-level wording.

## Papers whose primary family should change

### High-confidence mismatches

| Paper | Current | Independent | Why the current family misses the central unknown |
|---|---|---|---|
| `p_2017_lundberg_a_unified_approach` | ES | DC | Defines and unifies an attribution object; its axioms are not evidence of faithfulness. |
| `p_2021_jethani_fastshap_real_time_shapley` | ES | DC | Asks how to construct an efficient estimator for an accepted attribution target. |
| `p_2022_achtibat_from_attribution_maps` | ES | DC | Constructs a concept-level explanation combining “where” and “what”; it does not set a trust criterion. |
| `p_2022_olsson_in_context_learning` | TD | CM | The main hypothesis is that induction heads implement in-context learning; training emergence is evidence for that mechanism. |
| `p_2023_geiger_causal_abstraction_a` | CM | ES | Formalizes when a high-level algorithm is a faithful explanation of a low-level network. |
| `p_2023_conmy_towards_automated_circuit` | CM | DC | Develops and evaluates a procedure for constructing circuit explanations. |
| `p_2023_davies_discovering_variable_binding` | CM | DC | Asks how to automatically localize a subcomputation from causal desiderata. |
| `p_2023_lieberum_does_circuit_analysis` | CM | GT | Directly asks whether circuit analysis and circuit semantics scale to a 70B model and new label formats. |
| `p_2023_palit_towards_vision_language` | CM | DC | Primarily extends causal-tracing explanation construction to a multimodal architecture. |
| `p_2023_syed_attribution_patching_outperforms` | CM | DC | Develops a cheaper explanation/circuit-construction algorithm, rather than explaining one target behavior. |
| `p_2023_sakarvadia_attention_lens_a` | CM | DC | Constructs a lens for translating head outputs into interpretable vocabulary content. |
| `p_2023_lepori_uncovering_intermediate_variables` | CM | DC | Develops circuit probing to construct and test explanations around candidate intermediate variables. |
| `p_2024_ghandeharioun_patchscopes_a_unifying` | RF | DC | Unifies probing, projection, and intervention as a configurable way to elicit explanations from hidden states. |
| `p_2024_he_dictionary_learning_improves` | CM | DC | Asks how to construct feature-level circuits without patching. |
| `p_2024_ferrando_information_flow_routes` | CM | DC | Constructs scalable information-flow explanations for arbitrary predictions. |
| `p_2024_marks_sparse_feature_circuits` | CM | DC | Constructs interpretable feature-level causal graphs and uses them downstream. |
| `p_2024_o_neill_sparse_autoencoders_enable` | CM | DC | Proposes a procedure for identifying circuits from sparse codes without repeated ablation. |
| `p_2024_hsu_efficient_automated_circuit` | CM | DC | Develops a training-free, analytic circuit-construction method. |
| `p_2025_galichin_i_have_covered` | TD | RF | Primarily asks whether reasoning states are encoded as identifiable sparse features; post-training emergence is a subquestion. |
| `p_2025_minder_overcoming_sparsity_artifacts` | TD | ES | Tests whether apparent fine-tuning-specific features are real or artifacts of the measurement method. |
| `p_2025_mondal_language_specific_neurons` | CM | IC | Its main test is whether targeted neuron intervention or fine-tuning can improve cross-lingual transfer. |
| `p_2026_park_mechelk_a_mechanistic` | CM | IC | The goal is reliable elicitation of latent knowledge while distinguishing “knows but does not say” from absence. |

### Boundary mismatches

These papers genuinely span two families. The proposed primary family below follows the main
unknown stated by the authors; the current family remains useful as a related assignment.

| Paper | Current | Independent | Boundary judgment |
|---|---|---|---|
| `p_2016_alain_understanding_intermediate_layers` | RF | TD | Linear separability is the measure, but the paper uses it to study change across layers and training. |
| `p_2021_geiger_causal_abstractions_of` | CM | ES | The case study finds a mechanism, but the general question is how to verify a high-level causal explanation. |
| `p_2022_oikarinen_clip_dissect_automatic_description` | RF | DC | Neuron semantics are the target, but the central contribution is automatic open-vocabulary explanation construction. |
| `p_2022_burns_discovering_latent_knowledge` | CM | RF | It recovers a latent truth representation; it does not explain the computation that produces model outputs. |
| `p_2022_ilharco_editing_models_with` | RF | IC | Task vectors are a representation, but their defining questions are deletion, composition, and transfer through weight editing. |
| `p_2023_geiger_finding_alignments_between` | CM | DC | The empirical target is a causal representation, but the central problem is how to discover its alignment automatically. |
| `p_2023_goldowsky_dill_localizing_model_behavior` | CM | ES | Path patching constructs explanations, but the paper foregrounds how localization claims should be defined and falsified. |
| `p_2023_schwettmann_multimodal_neurons_in` | CM | RF | Causal intervention is used to establish where cross-modal semantic alignment is represented. |
| `p_2024_tang_language_specific_neurons` | CM | RF | The main unknown is whether language identity is concentrated in selective units; control is supporting causal evidence. |
| `p_2024_dunefsky_transcoders_find_interpretable` | CM | DC | It reveals MLP computation, but its central contribution is a representation and procedure for constructing feature circuits. |
| `p_2025_nam_causal_head_gating` | CM | DC | It reports distributed mechanisms, but the stated contribution is a scalable framework that assigns causal roles and extracts subcircuits. |
| `p_2026_zhou_sparse_visual_thought` | CM | RF | The central unknown is whether sparse visual features form modular, composable units or geometrically entangled directions. |

## Complete paper-by-paper comparison

`same` means the independent primary-family judgment agrees with the current graph. `change`
and `boundary` refer to the two tables above.

| Paper | Current | Independent | Result |
|---|---|---|---|
| `p_2016_alain_understanding_intermediate_layers` | RF | TD | boundary |
| `p_2017_bau_network_dissection_quantifying` | RF | RF | same |
| `p_2017_lundberg_a_unified_approach` | ES | DC | change |
| `p_2018_adebayo_sanity_checks_for` | ES | ES | same |
| `p_2019_hewitt_designing_and_interpreting` | ES | ES | same |
| `p_2019_wiegreffe_attention_is_not` | ES | ES | same |
| `p_2020_geva_transformer_feed_forward` | CM | CM | same |
| `p_2020_ravichander_probing_the_probing` | ES | ES | same |
| `p_2020_yang_feature_learning_in` | TD | TD | same |
| `p_2021_dai_knowledge_neurons_in` | CM | CM | same |
| `p_2021_geiger_causal_abstractions_of` | CM | ES | boundary |
| `p_2021_geiger_inducing_causal_structure` | IC | IC | same |
| `p_2021_jethani_fastshap_real_time_shapley` | ES | DC | change |
| `p_2021_yun_transformer_visualization_via` | RF | RF | same |
| `p_2022_achtibat_from_attribution_maps` | ES | DC | change |
| `p_2022_burns_discovering_latent_knowledge` | CM | RF | boundary |
| `p_2022_elhage_toy_models_of` | RF | RF | same |
| `p_2022_ilharco_editing_models_with` | RF | IC | boundary |
| `p_2022_li_emergent_world_representations` | RF | RF | same |
| `p_2022_meng_locating_and_editing` | CM | CM | same |
| `p_2022_oikarinen_clip_dissect_automatic_description` | RF | DC | boundary |
| `p_2022_olsson_in_context_learning` | TD | CM | change |
| `p_2022_radhakrishnan_mechanism_of_feature` | TD | TD | same |
| `p_2022_scherlis_polysemanticity_and_capacity` | RF | RF | same |
| `p_2022_wang_interpretability_in_the` | CM | CM | same |
| `p_2023_beaglehole_mechanism_of_feature` | TD | TD | same |
| `p_2023_belrose_eliciting_latent_predictions` | TD | TD | same |
| `p_2023_chughtai_a_toy_model` | GT | GT | same |
| `p_2023_conmy_towards_automated_circuit` | CM | DC | change |
| `p_2023_cunningham_sparse_autoencoders_find` | RF | RF | same |
| `p_2023_davies_discovering_variable_binding` | CM | DC | change |
| `p_2023_feng_how_do_language` | RF | RF | same |
| `p_2023_geiger_causal_abstraction_a` | CM | ES | change |
| `p_2023_geiger_finding_alignments_between` | CM | DC | boundary |
| `p_2023_geva_dissecting_recall_of` | CM | CM | same |
| `p_2023_goldowsky_dill_localizing_model_behavior` | CM | ES | boundary |
| `p_2023_gould_successor_heads_recurring` | GT | GT | same |
| `p_2023_guerner_a_geometric_notion` | RF | RF | same |
| `p_2023_gurnee_finding_neurons_in` | RF | RF | same |
| `p_2023_hanna_how_does_gpt` | CM | CM | same |
| `p_2023_hase_does_localization_inform` | IC | IC | same |
| `p_2023_lamparth_analyzing_and_editing` | CM | CM | same |
| `p_2023_lepori_uncovering_intermediate_variables` | CM | DC | change |
| `p_2023_li_inference_time_intervention` | IC | IC | same |
| `p_2023_lieberum_does_circuit_analysis` | CM | GT | change |
| `p_2023_merullo_circuit_component_reuse` | GT | GT | same |
| `p_2023_nanda_emergent_linear_representations` | RF | RF | same |
| `p_2023_nanda_progress_measures_for` | TD | TD | same |
| `p_2023_pal_future_lens_anticipating` | TD | TD | same |
| `p_2023_palit_towards_vision_language` | CM | DC | change |
| `p_2023_park_the_linear_representation` | RF | RF | same |
| `p_2023_sakarvadia_attention_lens_a` | CM | DC | change |
| `p_2023_schwettmann_multimodal_neurons_in` | CM | RF | boundary |
| `p_2023_stolfo_a_mechanistic_interpretation` | CM | CM | same |
| `p_2023_syed_attribution_patching_outperforms` | CM | DC | change |
| `p_2023_tigges_linear_representations_of` | RF | RF | same |
| `p_2023_todd_function_vectors_in` | RF | RF | same |
| `p_2023_varma_explaining_grokking_through` | TD | TD | same |
| `p_2023_voita_neurons_in_large` | RF | RF | same |
| `p_2023_zhang_towards_best_practices` | ES | ES | same |
| `p_2023_zou_representation_engineering_a` | IC | IC | same |
| `p_2024_arditi_refusal_in_language` | CM | CM | same |
| `p_2024_braun_identifying_functionally_important` | RF | RF | same |
| `p_2024_chanin_a_is_for` | RF | RF | same |
| `p_2024_draguns_unelicitable_backdoors_in` | ES | ES | same |
| `p_2024_dunefsky_transcoders_find_interpretable` | CM | DC | boundary |
| `p_2024_ferrando_information_flow_routes` | CM | DC | change |
| `p_2024_ghandeharioun_patchscopes_a_unifying` | RF | DC | change |
| `p_2024_hanna_have_faith_in` | ES | ES | same |
| `p_2024_he_dictionary_learning_improves` | CM | DC | change |
| `p_2024_he_llama_scope_extracting` | RF | RF | same |
| `p_2024_hinck_why_do_llava` | CM | CM | same |
| `p_2024_hsu_efficient_automated_circuit` | CM | DC | change |
| `p_2024_huang_ravel_evaluating_interpretability` | ES | ES | same |
| `p_2024_jin_cutting_off_the` | CM | CM | same |
| `p_2024_lieberum_gemma_scope_open` | RF | RF | same |
| `p_2024_makelov_towards_principled_evaluations` | ES | ES | same |
| `p_2024_marks_enhancing_neural_network` | RF | RF | same |
| `p_2024_marks_sparse_feature_circuits` | CM | DC | change |
| `p_2024_mcdougall_copy_suppression_comprehensively` | CM | CM | same |
| `p_2024_muhamed_decoding_dark_matter` | RF | RF | same |
| `p_2024_neo_towards_interpreting_visual` | CM | CM | same |
| `p_2024_nichani_how_transformers_learn` | TD | TD | same |
| `p_2024_o_neill_sparse_autoencoders_enable` | CM | DC | change |
| `p_2024_prakash_fine_tuning_enhances` | TD | TD | same |
| `p_2024_rajamanoharan_improving_dictionary_learning` | RF | RF | same |
| `p_2024_rajamanoharan_jumping_ahead_improving` | RF | RF | same |
| `p_2024_shai_transformers_represent_belief` | RF | RF | same |
| `p_2024_singh_what_needs_to` | TD | TD | same |
| `p_2024_tang_language_specific_neurons` | CM | RF | boundary |
| `p_2024_yao_knowledge_circuits_in` | CM | CM | same |
| `p_2024_zhou_on_the_role` | CM | CM | same |
| `p_2025_chen_transferring_linear_features` | GT | GT | same |
| `p_2025_galichin_i_have_covered` | TD | RF | change |
| `p_2025_jin_massive_values_in` | CM | CM | same |
| `p_2025_kantamneni_are_sparse_autoencoders` | ES | ES | same |
| `p_2025_kim_interpreting_attention_heads` | CM | CM | same |
| `p_2025_kim_reasoning_circuits_in` | CM | CM | same |
| `p_2025_li_taming_knowledge_conflicts` | CM | CM | same |
| `p_2025_minder_overcoming_sparsity_artifacts` | TD | ES | change |
| `p_2025_mondal_language_specific_neurons` | CM | IC | change |
| `p_2025_nam_causal_head_gating` | CM | DC | boundary |
| `p_2025_nikankin_same_task_different` | CM | CM | same |
| `p_2025_tang_a_unified_theory` | RF | RF | same |
| `p_2025_tian_why_representation_engineering` | IC | IC | same |
| `p_2025_viswanathan_the_intrinsic_dimension` | RF | RF | same |
| `p_2025_wu_axbench_steering_llms` | ES | ES | same |
| `p_2026_bhardia_mechanistic_analysis_of` | GT | GT | same |
| `p_2026_che_counting_circuits_mechanistic` | CM | CM | same |
| `p_2026_dalili_subspace_aware_sparse` | RF | RF | same |
| `p_2026_dura_mechanistic_interpretability_of` | TD | TD | same |
| `p_2026_filus_measuring_monosemanticity_in` | ES | ES | same |
| `p_2026_hai_when_and_why` | ES | ES | same |
| `p_2026_hegde_where_hallucinations_live` | CM | CM | same |
| `p_2026_liu_dual_pathway_circuits` | CM | CM | same |
| `p_2026_liu_ica_lens_interpreting` | RF | RF | same |
| `p_2026_munigety_from_correlation_to` | ES | ES | same |
| `p_2026_park_mechelk_a_mechanistic` | CM | IC | change |
| `p_2026_pillai_ftb_graph_determining` | CM | CM | same |
| `p_2026_ratnakar_the_geometry_of` | CM | CM | same |
| `p_2026_somani_towards_verifiable_transformers` | ES | ES | same |
| `p_2026_templeton_scaling_monosemanticity_extracting` | RF | RF | same |
| `p_2026_zhou_sparse_visual_thought` | CM | RF | boundary |

## Interpretation

The largest systematic error is not random paper misclassification. It is a missing axis in
the family model. Current `computational-mechanism` contains both papers explaining a model's
computation and papers designing procedures that construct an explanation. Those are different
research questions. Likewise, current `evidential-standards` mixes criteria for trusting an
explanation with axioms or algorithms that define and compute an explanation.

The audit itself did not modify paper records or the paper-level timeline RQs. Its approved
family findings were subsequently implemented in the working RQ graph, together with explicit
primary and secondary RQ assignments.
