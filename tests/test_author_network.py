import json
import unittest

import jsonschema

from scripts.build_author_network import ROOT, build_author_network, load_inputs


def author(name: str) -> dict:
    return {
        "canonical_name": name,
        "aliases": [],
        "external_ids": {"orcid": None, "openalex": None, "semantic_scholar": None},
        "current_affiliations": [],
        "profiles": {"homepage": None, "google_scholar": None},
    }


class AuthorNetworkTest(unittest.TestCase):
    def test_edge_weights_roles_and_collaborator_order(self) -> None:
        authors = {"a_a": author("Alpha"), "a_b": author("Beta"), "a_c": author("Gamma")}
        papers = {
            "p_one": {
                "authors": [
                    {"author_id": "a_a", "position": 1, "roles": ["first"]},
                    {"author_id": "a_b", "position": 2, "roles": ["middle"]},
                    {"author_id": "a_c", "position": 3, "roles": ["last"]},
                ]
            },
            "p_two": {
                "authors": [
                    {"author_id": "a_a", "position": 1, "roles": ["first"]},
                    {"author_id": "a_b", "position": 2, "roles": ["last"]},
                ]
            },
            "p_three": {
                "authors": [
                    {"author_id": "a_c", "position": 1, "roles": ["first", "last"]}
                ]
            },
        }
        corpus = {
            "corpus_id": "test",
            "version": 1,
            "papers": [{"paper_id": paper_id} for paper_id in papers],
        }

        network = build_author_network(corpus, papers, authors)
        nodes = {node["author_id"]: node for node in network["nodes"]}
        edges = {(edge["source"], edge["target"]): edge for edge in network["edges"]}

        self.assertEqual(
            network["statistics"],
            {"node_count": 3, "edge_count": 3, "isolated_node_count": 0},
        )
        self.assertEqual(edges[("a_a", "a_b")]["paper_count"], 2)
        self.assertEqual(nodes["a_a"]["first_author_paper_count"], 2)
        self.assertEqual(nodes["a_b"]["last_author_paper_ids"], ["p_two"])
        self.assertEqual(nodes["a_c"]["paper_count"], 2)
        self.assertEqual(nodes["a_c"]["first_author_paper_ids"], ["p_three"])
        self.assertEqual(nodes["a_c"]["last_author_paper_count"], 2)
        self.assertEqual(nodes["a_a"]["weighted_degree"], 3)
        self.assertEqual(
            [item["author_id"] for item in nodes["a_a"]["collaborators"]],
            ["a_b", "a_c"],
        )

    def test_unknown_author_reference_fails(self) -> None:
        corpus = {
            "corpus_id": "test",
            "version": 1,
            "papers": [{"paper_id": "p_one"}],
        }
        papers = {
            "p_one": {
                "authors": [
                    {
                        "author_id": "a_missing",
                        "position": 1,
                        "roles": ["first", "last"],
                    }
                ]
            }
        }
        with self.assertRaisesRegex(ValueError, "unknown author IDs"):
            build_author_network(corpus, papers, {})

    def test_current_corpus_network_is_consistent_and_schema_valid(self) -> None:
        corpus, papers, authors = load_inputs()
        network = build_author_network(corpus, papers, authors)
        schema = json.loads((ROOT / "schemas" / "author-network.schema.json").read_text())
        jsonschema.Draft202012Validator(
            schema, format_checker=jsonschema.FormatChecker()
        ).validate(network)

        nodes = {node["author_id"]: node for node in network["nodes"]}
        self.assertEqual(network["statistics"]["node_count"], len(nodes))
        self.assertEqual(network["statistics"]["edge_count"], len(network["edges"]))
        for edge in network["edges"]:
            self.assertLess(edge["source"], edge["target"])
            self.assertEqual(edge["paper_count"], len(edge["paper_ids"]))
            self.assertIn(
                edge["target"],
                {
                    item["author_id"]
                    for item in nodes[edge["source"]]["collaborators"]
                },
            )
            self.assertIn(
                edge["source"],
                {
                    item["author_id"]
                    for item in nodes[edge["target"]]["collaborators"]
                },
            )
        for node in nodes.values():
            self.assertEqual(node["paper_count"], len(node["paper_ids"]))
            self.assertEqual(
                node["first_author_paper_count"],
                len(node["first_author_paper_ids"]),
            )
            self.assertEqual(
                node["last_author_paper_count"], len(node["last_author_paper_ids"])
            )
            self.assertEqual(node["coauthor_count"], len(node["collaborators"]))
            self.assertEqual(
                node["weighted_degree"],
                sum(item["paper_count"] for item in node["collaborators"]),
            )


if __name__ == "__main__":
    unittest.main()
