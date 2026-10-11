# LLM Interpretability Knowledge Base

[简体中文](README.zh-CN.md) | **English**

## Live Interactive Atlas

### [Open the visualization platform →](https://atlas.interpretability.site/)

## Updates

> **Latest update (2026-10-09):** 13 representative papers were added to fill gaps in the Techniques taxonomy. The corpus now contains 123 papers: 100 recent core papers, 10 earlier classic papers, and 13 taxonomy supplements.

## About the project

The LLM Interpretability Knowledge Base helps researchers trace the development of LLM interpretability research through interactive visualizations. It organizes paper facts, research taxonomies, and the evolution of research questions as maintainable structured data, then presents them through several complementary views.

The current web application contains five main sections:

| Section | Purpose |
| --- | --- |
| **Research Questions** | A timeline and relationship graph positioned by the earliest appearance of each question. It shows how questions were extended, refined, transferred, or validated. Each node provides a bilingual overview, a progress summary, and related papers. |
| **Techniques** | A taxonomy of research methods for readout, attribution, decomposition, causal intervention, circuit discovery, model control, and explanation validation. |
| **Target Objects** | A taxonomy of the internal objects and processes being studied, such as representations, components, computational paths, and learning processes, with model-family filtering. |
| **Applications** | A taxonomy of the tasks, capabilities, and risk settings in which interpretability methods and mechanistic claims are studied or evaluated. |
| **Authors** | A co-authorship network for the corpus, with filters for first-, middle-, and last-author roles. |

The application also supports global paper search, Chinese/English switching, a resizable graph-and-details layout, node-level paper lists, and paper pages containing metadata, taxonomy paths, bilingual abstracts, and bilingual AI-generated summaries.

## Data provenance and selection

This project builds on the output of **PaperManage**, a separately deployed local agent maintained by the author. PaperManage supplied the initial corpus:

- 100 representative original empirical, methodological, or theoretical papers released within the five years preceding the search cutoff;
- 10 earlier classic papers with continued influence on subsequent interpretability research.

The initial corpus passed through broad candidate discovery, title-and-abstract screening, identity verification, lawful full-text acquisition, Docling extraction, and full-text evidence review. A later set of 13 papers fills Techniques branches that lacked a representative paper; it does not alter the original 100+10 membership. See the [paper selection methodology](docs/paper-selection-methodology.md) for the complete criteria and stage counts.

Paper PDFs and Docling-extracted full-text Markdown are **not included in this repository** and are not required to run the website. The repository contains the structured paper metadata used by the application, English abstracts and Chinese translations, bilingual AI-generated summaries, taxonomy data, and the research-question graph. PaperKnowledgeBase remains a separate, read-only local source for the original texts.

## Run locally

The frontend uses plain HTML, CSS, and JavaScript, with no Node.js dependency or frontend build tool. Data-generation scripts run in the dedicated Conda environment `interpret-vis`.

### 1. Clone the repository and create the environment

```bash
git clone https://github.com/ZhaoyueSun/llm-interpretability-kb.git
cd LLM-Interpretability-KB
conda env create -f environment.yml
```

If the environment already exists, update it from the current environment file:

```bash
conda env update -n interpret-vis -f environment.yml --prune
```

### 2. Build derived web data

```bash
conda run -n interpret-vis python scripts/build_author_network.py
conda run -n interpret-vis python scripts/build_web_data.py
```

The intermediate author network is written to `.generated/` and remains ignored by Git. The ready-to-serve web dataset is written to `web/.generated/knowledge-base.json` and committed so the website works immediately after cloning. Both files are reproducible and must not be treated as sources of record.

### 3. Start the local website

```bash
conda run -n interpret-vis python -m http.server 4173 --directory web
```

Open [http://localhost:4173/](http://localhost:4173/) in a browser.

## Repository layout

```text
.
├── data/                 # Source data: papers, authors, corpus, taxonomies, and classification events
│   ├── papers/           # One YAML file per paper
│   └── taxonomies/       # Techniques, Target Objects, and Applications taxonomies
├── docs/                 # Selection, data-model, writing, audit, and visualization documents
├── schemas/              # JSON Schemas for source and derived data
├── scripts/              # Import, audit, validation, and web-data build scripts
├── tests/                # Data and build-logic tests
├── web/                  # Static frontend; .generated/ contains locally built web data
├── imports/              # Local handoff staging directory; excluded from Git
├── environment.yml       # Definition of the interpret-vis Conda environment
├── AGENTS.md             # Data-maintenance and agent-collaboration rules
└── PROJECT_CHARTER.md     # Project goals, boundaries, and data-management principles
```

`data/` is the source of record. Web JSON, the author network, and search indexes are reproducible derived artifacts. See the [data model](docs/data-model.md) and topic-specific writing guides for field definitions and update procedures.
