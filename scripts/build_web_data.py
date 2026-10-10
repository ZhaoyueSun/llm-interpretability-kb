#!/usr/bin/env python3
"""Build the read-only JSON bundle consumed by the initial web visualization."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

import yaml


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUTPUT = ROOT / "web" / ".generated" / "knowledge-base.json"
RQ_GRAPH_SOURCE = ROOT / "docs" / "research-question-graph-draft.yaml"


def load_yaml(path: Path) -> dict[str, Any]:
    with path.open(encoding="utf-8") as handle:
        return yaml.safe_load(handle)


def load_json(path: Path) -> dict[str, Any]:
    with path.open(encoding="utf-8") as handle:
        return json.load(handle)


def load_events(path: Path) -> list[dict[str, Any]]:
    events: list[dict[str, Any]] = []
    with path.open(encoding="utf-8") as handle:
        for line_number, line in enumerate(handle, start=1):
            if not line.strip():
                continue
            try:
                events.append(json.loads(line))
            except json.JSONDecodeError as error:
                raise ValueError(f"{path}:{line_number}: {error}") from error
    return events


def reduce_events(events: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Reduce the append-only event stream to current active relations."""

    active_by_event: dict[str, dict[str, Any]] = {}
    latest_by_relation: dict[tuple[str, str, str, str], str] = {}

    for event in events:
        event_id = event["event_id"]
        action = event["action"]
        superseded_id = event.get("supersedes_event_id")

        if action in {"revoke", "replace"} and superseded_id:
            superseded = active_by_event.pop(superseded_id, None)
            if superseded:
                key = (
                    superseded["paper_id"],
                    superseded["taxonomy_id"],
                    superseded["node_id"],
                    superseded["relation_role"],
                )
                latest_by_relation.pop(key, None)

        if action == "revoke":
            continue

        key = (
            event["paper_id"],
            event["taxonomy_id"],
            event["node_id"],
            event["relation_role"],
        )
        previous_id = latest_by_relation.get(key)
        if previous_id:
            active_by_event.pop(previous_id, None)
        latest_by_relation[key] = event_id
        active_by_event[event_id] = event

    return list(active_by_event.values())


def paper_payload(paper: dict[str, Any], corpus_entry: dict[str, Any]) -> dict[str, Any]:
    return {
        "paper_id": paper["paper_id"],
        "title": paper["title"],
        "year": paper.get("year"),
        "earliest_public_date": paper.get("earliest_public_date"),
        "earliest_public_date_precision": paper.get("earliest_public_date_precision"),
        "venue": paper.get("venue"),
        "publication_type": paper.get("publication_type"),
        "identifiers": paper.get("identifiers", {}),
        "links": paper.get("links", {}),
        "authors": paper.get("authors", []),
        "abstract": {
            "en": paper.get("abstract", {}).get("en"),
            "zh": paper.get("abstract", {}).get("zh"),
        },
        "ai_summary": {
            "en": paper.get("ai_summary", {}).get("en"),
            "zh": paper.get("ai_summary", {}).get("zh"),
        },
        "attributes": paper.get("attributes", {}),
        "display_order": corpus_entry.get("display_order"),
        "inclusion_reason": corpus_entry.get("inclusion_reason"),
    }


def research_question_payload(graph: dict[str, Any], paper_ids: set[str]) -> dict[str, Any]:
    """Prepare the working RQ graph for read-only visualization.

    RQ01-style codes are presentation labels derived deterministically from first date;
    the source ``rq_id`` remains the stable identifier.
    """

    ordered_nodes = sorted(
        graph["nodes"],
        key=lambda node: (str(node["first_date"]), node["rq_id"]),
    )
    nodes: list[dict[str, Any]] = []
    referenced_papers: set[str] = set()
    for index, node in enumerate(ordered_nodes, start=1):
        payload = dict(node)
        payload["display_code"] = f"RQ{index:02d}"
        nodes.append(payload)
        referenced_papers.update(node.get("primary_paper_ids", []))
        referenced_papers.update(node.get("secondary_paper_ids", []))

    missing = sorted(referenced_papers - paper_ids)
    if missing:
        raise ValueError(f"RQ graph references papers outside the corpus: {', '.join(missing)}")

    return {
        "schema_version": graph["schema_version"],
        "status": graph["status"],
        "updated_at": graph["updated_at"],
        "families": sorted(graph["families"], key=lambda family: family["display_order"]),
        "nodes": nodes,
        "edges": graph["edges"],
        "edge_evidence_levels": graph["edge_evidence_levels"],
    }


def build_bundle() -> dict[str, Any]:
    corpus = load_yaml(ROOT / "data" / "corpus.yaml")
    corpus_by_id = {entry["paper_id"]: entry for entry in corpus["papers"]}

    papers: dict[str, dict[str, Any]] = {}
    for paper_path in sorted((ROOT / "data" / "papers").glob("*.yaml")):
        paper = load_yaml(paper_path)
        paper_id = paper["paper_id"]
        if paper_id not in corpus_by_id:
            continue
        papers[paper_id] = paper_payload(paper, corpus_by_id[paper_id])

    missing_papers = sorted(set(corpus_by_id) - set(papers))
    if missing_papers:
        raise ValueError(f"Missing paper files for corpus IDs: {', '.join(missing_papers)}")

    taxonomies: dict[str, dict[str, Any]] = {}
    for taxonomy_id, filename in {
        "techniques": "techniques.yaml",
        "research-object": "research-object.yaml",
        "application-scenarios": "application-scenarios.yaml",
    }.items():
        taxonomy = load_yaml(ROOT / "data" / "taxonomies" / filename)
        active_nodes = [node for node in taxonomy["nodes"] if node.get("status") == "active"]
        taxonomies[taxonomy_id] = {
            "taxonomy_id": taxonomy["taxonomy_id"],
            "title": taxonomy["title"],
            "version": taxonomy["version"],
            "nodes": active_nodes,
        }

    relations = reduce_events(load_events(ROOT / "data" / "classification-events.jsonl"))
    relations = [
        {
            "event_id": event["event_id"],
            "paper_id": event["paper_id"],
            "taxonomy_id": event["taxonomy_id"],
            "node_id": event["node_id"],
            "relation_role": event["relation_role"],
        }
        for event in relations
        if event["paper_id"] in papers and event["taxonomy_id"] in taxonomies
    ]

    model_families = load_yaml(ROOT / "data" / "model-families.yaml")
    controlled_vocabulary = load_yaml(ROOT / "data" / "controlled-vocabulary.yaml")
    research_question_graph = load_yaml(RQ_GRAPH_SOURCE)
    author_network_path = ROOT / ".generated" / "author-network.json"
    if not author_network_path.exists():
        raise ValueError(
            "Missing .generated/author-network.json; run "
            "`conda run -n interpret-vis python scripts/build_author_network.py` first"
        )
    author_network = load_json(author_network_path)
    generated_from = author_network.get("generated_from", {})
    if (
        generated_from.get("corpus_id") != corpus["corpus_id"]
        or generated_from.get("corpus_version") != corpus["version"]
        or generated_from.get("paper_count") != len(papers)
    ):
        raise ValueError("Author network was generated from a different corpus version")

    return {
        "schema_version": 1,
        "corpus": {
            "corpus_id": corpus["corpus_id"],
            "version": corpus["version"],
            "paper_count": len(papers),
        },
        "papers": papers,
        "taxonomies": taxonomies,
        "relations": relations,
        "model_families": {
            "families": model_families["families"],
            "paper_assignments": model_families["paper_assignments"],
        },
        "author_network": author_network,
        "research_question_graph": research_question_payload(research_question_graph, set(papers)),
        "controlled_vocabulary": {
            "paper_attributes": controlled_vocabulary["paper_attributes"],
            "taxonomy_relation_roles": controlled_vocabulary["taxonomy_relation_roles"],
        },
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("output", nargs="?", type=Path, default=DEFAULT_OUTPUT)
    args = parser.parse_args()

    output = args.output.resolve()
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open("w", encoding="utf-8") as handle:
        json.dump(build_bundle(), handle, ensure_ascii=False, indent=2, default=str)
        handle.write("\n")
    print(f"Wrote {output}")


if __name__ == "__main__":
    main()
