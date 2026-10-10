# Research Question Graph Coverage Audit

Status: working draft; updated after seven-family reassignment
Updated: 2026-10-10
Scope: coverage and balance review only; this is not an approved taxonomy proposal.

## Current coverage

The graph contains 69 normalized RQ nodes and 57 temporal relations. All 123 corpus
papers have exactly one primary RQ assignment; 28 papers have at least one explicit secondary
RQ, for 29 secondary assignments in total. Secondary assignments are non-exclusive and do not
change the paper's primary family.

| RQ family | Nodes | Primary papers | Secondary assignments |
|---|---:|---:|---:|
| Representation form | 18 | 33 | 6 |
| Computational mechanism | 10 | 26 | 7 |
| Mechanism explanation | 12 | 19 | 4 |
| Intervention and control | 6 | 8 | 3 |
| Temporal development and learning | 8 | 12 | 5 |
| Evidential standards | 13 | 19 | 4 |
| Generality and transfer | 2 | 6 | 0 |

The reassignment separates the model's actual computation from the analyst-facing construction
of a mechanism explanation. It also separates primary questions from supporting temporal,
control, or evidential subquestions. Paper counts should not determine lane width or visual
prominence: the visualization should weight normalized questions and navigation needs rather
than raw counts.

## Learning-process and temporal coverage

Learning processes are represented as scientific questions rather than as a target-object
label. The temporal branch distinguishes:

- feature formation during training;
- formation of concrete circuits from initialization;
- apparently abrupt capability transitions;
- prediction revision across network depth;
- commitment to future tokens during generation;
- mechanism change during fine-tuning and post-training;
- causal computation across generated Chain-of-Thought steps.

This separation prevents training time, layer depth, and generation time from being merged
into a generic “dynamics” node. The CoT node is therefore not “CoT as an application”; its
unknown predicate is how causal computation is passed and reorganized across reasoning
steps.

## Relationship evidence

Of the 57 relations:

- 36 are `direct-citation`: a later paper substantively engages an earlier paper in its
  main text;
- 16 are `same-lineage`: the scientific question clearly continues, but no substantive
  main-text citation was verified;
- 5 are `analyst-inference`: useful synthesis edges that must be displayed as inference,
  not as paper-authored historical claims.

Reference-list matches and shared techniques were not sufficient for adding an edge.

## Independent roots retained intentionally

Three nodes currently have no evolution edge: world-model representation, compositional
binding, and multilingual mechanisms. They are retained as independent roots rather than
being attached through a shared object, task, or intervention technique. Future corpus
additions may supply genuine predecessors or descendants.

## Guardrails for the visualization agent

- Use RQ families only as broad visual lanes; do not convert them into parent RQ nodes.
- Keep edge evidence visually distinguishable, especially `analyst-inference`.
- Resolve Research Objects, Techniques, and Applications through paper IDs in the detail
  panel instead of duplicating them as RQ branches.
- Show both paper-level RQ and normalized timeline RQ in paper details so that aggregation
  remains auditable.
