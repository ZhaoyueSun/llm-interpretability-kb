#!/usr/bin/env python3
"""Audit bilingual AI summaries for required structure and evidence signals."""

from pathlib import Path
import re
import sys

import yaml


ROOT = Path(__file__).resolve().parents[1]
PAPERS = ROOT / "data" / "papers"
HEADINGS = {
    "en": (("Research Question", "."), ("Method", "."), ("Validation", "."), ("Conclusion & Evidence", ".")),
    "zh": (("研究问题", "。"), ("方法", "。"), ("实验验证", "。"), ("结论与证据", "。")),
}
FIRST_PERSON = re.compile(r"(?i)(?<![A-Za-z])(we|our|ours|us)(?![A-Za-z])|我们")
EVIDENCE = re.compile(
    r"\d|dataset|benchmark|model|ablat|patch|interven|control|metric|accuracy|loss|"
    r"Transformer|SAE|IOI|RoPE|logit|数据|基准|模型|任务|消融|修补|干预|对照|指标|准确率|损失",
    re.I,
)
ACRONYMS = {
    "IOI": ("Indirect Object Identification", "间接宾语识别"),
    "SAE": ("Sparse Autoencoder", "稀疏自编码器"),
    "MLP": ("multilayer perceptron", "多层感知机"),
    "PCA": ("Principal Component Analysis", "主成分分析"),
    "ICA": ("Independent Component Analysis", "独立成分分析"),
    "CCS": ("Contrast-Consistent Search", "对比一致性搜索"),
    "ASR": ("Attack Success Rate", "攻击成功率"),
    "AUC": ("area under", "曲线下面积"),
    "EAP": ("Edge Attribution Patching", "边归因修补"),
    "LAPE": ("Language Activation Probability Entropy", "语言激活概率熵"),
    "RoPE": ("Rotary Positional Encoding", "旋转位置编码"),
}


def marker(heading: tuple[str, str]) -> str:
    return f"**{heading[0]}{heading[1]}**"


def section(text: str, heading: tuple[str, str], next_heading: tuple[str, str] | None) -> str:
    current = marker(heading)
    start = text.index(current) + len(current)
    end = text.index(marker(next_heading), start) if next_heading else len(text)
    return text[start:end]


def main() -> int:
    failures: list[str] = []
    files = sorted(PAPERS.glob("*.yaml"))
    for path in files:
        doc = yaml.safe_load(path.read_text())
        summary = doc.get("ai_summary") or {}
        for lang, headings in HEADINGS.items():
            text = summary.get(lang, "")
            if not text:
                failures.append(f"{path.name}:{lang}: missing summary")
                continue
            for heading in headings:
                if text.count(marker(heading)) != 1:
                    failures.append(f"{path.name}:{lang}: heading {heading[0]!r} not unique")
            if FIRST_PERSON.search(text):
                failures.append(f"{path.name}:{lang}: first-person author voice")
            for acronym, expansions in ACRONYMS.items():
                if re.search(rf"(?<![A-Za-z]){acronym}(?![A-Za-z])", text):
                    expected = expansions[0 if lang == "en" else 1]
                    if expected.lower() not in text.lower():
                        failures.append(f"{path.name}:{lang}: {acronym} is not expanded")
            if len(text) < (1100 if lang == "en" else 450):
                failures.append(f"{path.name}:{lang}: summary is too short")
            if all(text.count(marker(h)) == 1 for h in headings):
                validation = section(text, headings[2], headings[3])
                if len(EVIDENCE.findall(validation)) < 2:
                    failures.append(f"{path.name}:{lang}: validation lacks concrete evidence signals")
        generation = summary.get("generation") or {}
        if generation.get("status") != "complete" or generation.get("third_party_api_used") is not False:
            failures.append(f"{path.name}: invalid generation metadata")

    if failures:
        print("AI summary audit failed:")
        print("\n".join(f"- {failure}" for failure in failures))
        return 1
    print(f"AI summary audit passed: {len(files)} papers, bilingual four-section summaries, third-person voice, validation evidence present")
    return 0


if __name__ == "__main__":
    sys.exit(main())
