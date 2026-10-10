import json
import unittest
from pathlib import Path

import jsonschema
import yaml


ROOT = Path(__file__).resolve().parents[1]
PAPERS_DIR = ROOT / "data" / "papers"


class PaperDataTest(unittest.TestCase):
    def test_all_papers_are_schema_valid_and_have_bilingual_ai_summaries(self) -> None:
        schema = json.loads((ROOT / "schemas" / "paper.schema.json").read_text())
        validator = jsonschema.Draft202012Validator(
            schema, format_checker=jsonschema.FormatChecker()
        )
        paths = sorted(PAPERS_DIR.glob("*.yaml"))
        corpus = yaml.safe_load((ROOT / "data" / "corpus.yaml").read_text())
        self.assertEqual(len(paths), len(corpus["papers"]))

        headings = {
            "en": [
                "**Research Question.**",
                "**Method.**",
                "**Validation.**",
                "**Conclusion & Evidence.**",
            ],
            "zh": [
                "**研究问题。**",
                "**方法。**",
                "**实验验证。**",
                "**结论与证据。**",
            ],
        }
        for path in paths:
            with self.subTest(path=path.name):
                paper = yaml.safe_load(path.read_text())
                validator.validate(paper)
                self.assertEqual(paper["paper_id"], path.stem)
                summary = paper["ai_summary"]
                self.assertEqual(summary["generation"]["status"], "complete")
                self.assertFalse(summary["generation"]["third_party_api_used"])
                for language, expected_headings in headings.items():
                    text = summary[language]
                    for heading in expected_headings:
                        self.assertEqual(text.count(heading), 1)


if __name__ == "__main__":
    unittest.main()
