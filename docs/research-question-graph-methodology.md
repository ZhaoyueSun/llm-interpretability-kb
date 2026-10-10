# Research Question Graph Methodology

Status: working draft
Scope: Research Questions tab only; this document does not modify any approved taxonomy or classification event.

## 1. What an RQ node represents

An RQ node represents a scientific uncertainty that can be stated as a question and
that is shared, refined, challenged, or extended by one or more papers. It is not a
paper topic, technique name, model component, task label, or contribution type.

Each paper retains two levels of analysis:

1. **Paper-level RQ** reconstructs the question actually asked in the paper, retaining
   its object, conditions, technique-dependent evidence, and experimental scope.
2. **Normalized RQ** removes replaceable implementation and task details so that the
   question can be compared with earlier and later work. It preserves the scientific
   unknown and its evidential boundary.

The paper-level wording remains in
`docs/research-question-timeline-draft.md`. The graph groups those paper-level questions
into normalized nodes without overwriting them.

## 2. Separation from the three approved classifications

For every paper, extraction is factorized into four fields:

| Field | Diagnostic question | Example |
|---|---|---|
| Research Object | What entity or process is being explained? | residual-stream state, attention head, circuit, training trajectory |
| Technique | What operation produces the evidence? | probing, activation patching, SAE training, steering |
| Application | In what task or behavior is the claim tested? | factual recall, multilingual generation, mathematical CoT |
| Research Question | What remains unknown about the object? | Does decodability imply causal use? How does causal computation unfold across generated reasoning steps? |

Research Objects, Techniques, and Applications are resolved from their existing data.
The RQ graph stores paper IDs and does not duplicate those classifications. The web
layer can aggregate their metadata through the primary and secondary papers.

### Substitution tests

- If the technique can be replaced while the scientific uncertainty remains, the work
  belongs to the same RQ node.
- If the application can be replaced while the scientific uncertainty remains, the new
  paper is cross-domain evidence for the same RQ rather than a new branch.
- If replacing the research object changes the unknown mechanism or evidential claim,
  the paper may instantiate a new child RQ.
- A noun phrase such as “Sparse Autoencoders,” “Attention Heads,” “Learning Processes,”
  or “Mathematical Reasoning” cannot by itself be an RQ node.

### Method-paper exception

A technique may be the subject of an RQ when the paper asks about its validity, limits,
or utility. The node is still phrased as the unknown claim—for example, “When does a
probe's null result imply absence of information?”—rather than as “Probing.”

## 3. Node merge and split rules

Two paper-level RQs are merged only when they share all three of the following:

1. the same unknown predicate, such as existence, formation, causal use, controllability,
   generalization, or evidential validity;
2. compatible claim scope;
3. an answer to one would materially answer the other.

They remain separate when they differ only superficially in vocabulary but require
different evidence. In particular, the graph keeps these distinctions:

- information availability vs. causal use;
- component localization vs. complete circuit explanation;
- training-time formation vs. depth-wise computation vs. generation-time dynamics;
- causal localization vs. effective intervention target;
- feature reconstruction vs. feature interpretability or downstream utility;
- functional equivalence vs. structural universality.

## 4. Relationship types

Edges represent changes in the scientific question, not shared techniques, objects, or
applications. Edge direction follows publication time from an earlier RQ to a later RQ;
the type describes how the later question treats the earlier one.

- `refines`: narrows the unknown or demands a more specific answer.
- `challenges`: questions an assumption, inference, or adequacy criterion.
- `extends`: adds a new regime, time scale, model class, or consequence.
- `integrates`: joins questions that were previously studied separately.
- `validates`: raises or operationalizes the required evidence standard.
- `scales`: asks whether the same question can be answered at materially larger scope.
- `formalizes`: turns an empirical question into an explicit mathematical or
  solver-checkable claim.

Each edge also has one of three evidence levels:

- `direct-citation`: a target-node paper cites a source-node paper in its main text and
  substantively uses, tests, criticizes, or extends the earlier problem framing. A
  bibliography match alone is insufficient.
- `same-lineage`: the two questions form a clear conceptual continuation, but the corpus
  does not provide a verified substantive main-text citation between them.
- `analyst-inference`: the edge is a synthesis introduced by this graph. It is useful for
  navigation, but must not be presented as a historical claim made by the papers.

The node's `first_date` is the earliest public date of a paper that actually poses that
normalized question. Earlier antecedents may be listed as secondary papers, but they do not
move the node backward unless they already formulate the same unknown. This prevents an
assumption in an earlier method paper from being mistaken for the first appearance of a
later challenge to that assumption.

## 5. Coverage audit

Before a graph version is proposed for approval:

1. every corpus paper must be attached to at least one concrete RQ node;
2. every paper has exactly one primary RQ, while any additional paper-level questions are
   represented by `secondary_paper_ids` on the corresponding nodes;
3. every node must have a self-contained introduction and at least one paper;
4. every edge must include a short rationale and an evidence status;
5. every edge must point from an earlier `first_date` to a later one, and every
   `direct-citation` edge must survive manual context review rather than string matching
   alone;
6. uncategorized papers and singleton nodes are reported rather than silently forced into
   an ill-fitting branch;
7. branch coverage is checked across publication years, model families, applications,
   research objects, and techniques to expose sampling bias without turning those facets
   into RQ branches.

## 6. Visualization contract

The left side visualizes normalized RQ nodes and their temporal relationships. Clicking a
node shows its bilingual question, introduction, and corpus-progress summary on the right
and allows switching to its paper list, which separates primary from secondary papers. The introduction defines the question and
its boundary; the progress summary synthesizes what the attached papers have established,
where they disagree, and what remains unresolved.
Paper details retain the paper-level RQ and the existing Research Object, Technique, and
Application classifications. Broad visual lanes are organizational aids, not additional
taxonomies or substitutes for graph edges. Each lane carries bilingual labels, a guiding
question, a scope explanation, and an evolution summary; these fields describe the lane
but do not create parent RQ nodes or imply additional graph edges.

The display order is: Representation Form → Computational Mechanism → Mechanism Explanation
→ Intervention and Control → Temporal Development and Learning → Evidential Standards →
Generality and Transfer. This is a reading order from internal structure to scope of validity,
not a claim that every research lineage passes through all seven lanes.

For paper lists and paper details, `primary_paper_ids` means that the node is the paper's central
scientific unknown. `secondary_paper_ids` means that the paper substantively asks or answers the
node as an additional question. Merely using the same technique, object, or application is not
enough for a secondary assignment.

Technique and RQ family are independent axes. A technique records the operation performed; an RQ
family records the paper's central scientific unknown. Readout and measurement can support questions
about representation, temporal development, explanation construction, or evidence. Causal
intervention can support questions in all seven families. Therefore an RQ family must never be
inferred mechanically from a paper's Technique assignment.

“Representation Form” refers specifically to the form of information encoded inside the model.
It does not include every human-facing explanation format. SHAP-style feature attribution is kept as
a boundary branch of “Mechanism Explanation” because the papers define or compute an inspectable
explanation artifact; their node text must state explicitly that this does not by itself recover an
internal causal mechanism.
