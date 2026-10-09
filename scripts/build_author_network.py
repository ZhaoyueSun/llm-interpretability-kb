#!/usr/bin/env python3
"""Build the complete, unpruned coauthorship network for the current corpus."""

from __future__ import annotations

import argparse
import itertools
import json
from collections import defaultdict
from pathlib import Path
from typing import Any

import yaml


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUTPUT = ROOT / ".generated" / "author-network.json"


def load_yaml(path: Path) -> dict[str, Any]:
    with path.open(encoding="utf-8") as handle:
        return yaml.safe_load(handle)


def load_inputs() -> tuple[dict[str, Any], dict[str, dict[str, Any]], dict[str, Any]]:
    corpus = load_yaml(ROOT / "data" / "corpus.yaml")
    authors = load_yaml(ROOT / "data" / "authors.yaml")["authors"]
    papers: dict[str, dict[str, Any]] = {}
    for path in sorted((ROOT / "data" / "papers").glob("*.yaml")):
        paper = load_yaml(path)
        papers[paper["paper_id"]] = paper
    return corpus, papers, authors


def validate_paper_authors(
    paper_id: str,
    paper_authors: list[dict[str, Any]],
    authors: dict[str, dict[str, Any]],
) -> list[dict[str, Any]]:
    ordered = sorted(paper_authors, key=lambda item: item["position"])
    positions = [item["position"] for item in ordered]
    expected_positions = list(range(1, len(ordered) + 1))
    if positions != expected_positions:
        raise ValueError(
            f"{paper_id}: author positions must be consecutive from 1; got {positions}"
        )

    author_ids = [item["author_id"] for item in ordered]
    if len(author_ids) != len(set(author_ids)):
        raise ValueError(f"{paper_id}: duplicate author IDs in one paper")
    missing = sorted(set(author_ids) - set(authors))
    if missing:
        raise ValueError(f"{paper_id}: unknown author IDs: {', '.join(missing)}")
    return ordered


def build_author_network(
    corpus: dict[str, Any],
    papers: dict[str, dict[str, Any]],
    authors: dict[str, dict[str, Any]],
) -> dict[str, Any]:
    """Return a deterministic full coauthorship graph for corpus papers."""

    corpus_entries = corpus["papers"]
    corpus_ids = [entry["paper_id"] for entry in corpus_entries]
    if len(corpus_ids) != len(set(corpus_ids)):
        raise ValueError("data/corpus.yaml contains duplicate paper IDs")
    missing_papers = sorted(set(corpus_ids) - set(papers))
    if missing_papers:
        raise ValueError(f"Missing paper files: {', '.join(missing_papers)}")

    paper_ids_by_author: dict[str, set[str]] = defaultdict(set)
    first_paper_ids_by_author: dict[str, set[str]] = defaultdict(set)
    last_paper_ids_by_author: dict[str, set[str]] = defaultdict(set)
    paper_ids_by_edge: dict[tuple[str, str], set[str]] = defaultdict(set)

    for paper_id in corpus_ids:
        ordered_authors = validate_paper_authors(
            paper_id, papers[paper_id]["authors"], authors
        )
        author_ids = [item["author_id"] for item in ordered_authors]
        for item in ordered_authors:
            author_id = item["author_id"]
            roles = set(item.get("roles", []))
            paper_ids_by_author[author_id].add(paper_id)
            if "first" in roles:
                first_paper_ids_by_author[author_id].add(paper_id)
            if "last" in roles:
                last_paper_ids_by_author[author_id].add(paper_id)
        for left, right in itertools.combinations(sorted(author_ids), 2):
            paper_ids_by_edge[(left, right)].add(paper_id)

    collaborators: dict[str, list[dict[str, Any]]] = defaultdict(list)
    edges: list[dict[str, Any]] = []
    for (source, target), shared_paper_ids in sorted(paper_ids_by_edge.items()):
        paper_ids = sorted(shared_paper_ids)
        edge = {
            "source": source,
            "target": target,
            "paper_ids": paper_ids,
            "paper_count": len(paper_ids),
        }
        edges.append(edge)
        collaborators[source].append(
            {"author_id": target, "paper_ids": paper_ids, "paper_count": len(paper_ids)}
        )
        collaborators[target].append(
            {"author_id": source, "paper_ids": paper_ids, "paper_count": len(paper_ids)}
        )

    nodes: list[dict[str, Any]] = []
    for author_id in sorted(paper_ids_by_author):
        author = authors[author_id]
        adjacent = sorted(
            collaborators[author_id],
            key=lambda item: (
                -item["paper_count"],
                authors[item["author_id"]]["canonical_name"].casefold(),
                item["author_id"],
            ),
        )
        paper_ids = sorted(paper_ids_by_author[author_id])
        first_paper_ids = sorted(first_paper_ids_by_author[author_id])
        last_paper_ids = sorted(last_paper_ids_by_author[author_id])
        nodes.append(
            {
                "author_id": author_id,
                "canonical_name": author["canonical_name"],
                "aliases": author["aliases"],
                "external_ids": author["external_ids"],
                "current_affiliations": author["current_affiliations"],
                "profiles": author["profiles"],
                "paper_ids": paper_ids,
                "paper_count": len(paper_ids),
                "first_author_paper_ids": first_paper_ids,
                "first_author_paper_count": len(first_paper_ids),
                "last_author_paper_ids": last_paper_ids,
                "last_author_paper_count": len(last_paper_ids),
                "coauthor_count": len(adjacent),
                "weighted_degree": sum(item["paper_count"] for item in adjacent),
                "collaborators": adjacent,
            }
        )

    isolated_node_count = sum(node["coauthor_count"] == 0 for node in nodes)
    return {
        "schema_version": 1,
        "network_type": "coauthorship",
        "generated_from": {
            "corpus_id": corpus["corpus_id"],
            "corpus_version": corpus["version"],
            "paper_count": len(corpus_ids),
        },
        "statistics": {
            "node_count": len(nodes),
            "edge_count": len(edges),
            "isolated_node_count": isolated_node_count,
        },
        "nodes": nodes,
        "edges": edges,
    }


def write_json(path: Path, payload: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + ".tmp")
    with temporary.open("w", encoding="utf-8") as handle:
        json.dump(payload, handle, ensure_ascii=False, indent=2)
        handle.write("\n")
    temporary.replace(path)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("output", nargs="?", type=Path, default=DEFAULT_OUTPUT)
    args = parser.parse_args()

    corpus, papers, authors = load_inputs()
    network = build_author_network(corpus, papers, authors)
    output = args.output.resolve()
    write_json(output, network)
    stats = network["statistics"]
    print(
        f"Wrote {output} "
        f"({stats['node_count']} nodes, {stats['edge_count']} edges, "
        f"{stats['isolated_node_count']} isolated nodes)"
    )


if __name__ == "__main__":
    main()
