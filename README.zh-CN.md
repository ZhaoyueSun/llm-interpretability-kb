# LLM Interpretability Knowledge Base

**简体中文** | [English](README.md)

## 在线交互式可视化平台

### [立即访问可视化平台 →](https://atlas.interpretability.site/)

> **最新更新（2026-10-09）**：针对 Techniques 分类中的分支空缺，补充了 13 篇代表性论文。当前语料库共收录 123 篇论文：100 篇近五年 core papers、10 篇较早的 classic papers，以及 13 篇 taxonomy supplements。

## 项目介绍

LLM Interpretability Knowledge Base 旨在帮助大语言模型可解释性研究者以可视化方式梳理研究脉络。项目将论文事实、研究分类和论文间的研究问题演化关系组织为可持续更新的结构化数据，并通过网页提供多种互补视角。

当前网页包含五个主要板块：

| 板块 | 用途 |
| --- | --- |
| **Research Questions** | 按研究问题最早出现的时间绘制时间—关系图，展示问题之间的延伸、细化、迁移和验证关系；点击节点可查看中英文介绍、当前进展和相关论文。 |
| **Techniques** | 以分类树展示读出、归因、分解、因果干预、circuit discovery、模型控制和解释验证等研究方法。 |
| **Target Objects** | 展示研究者实际分析的模型内部对象与过程，例如表征、组件、计算路径和学习过程；可按模型族过滤。 |
| **Applications** | 展示解释方法和机制主张在哪些任务、能力与风险场景中被研究和验证。 |
| **Authors** | 以作者合作网络展示 corpus 内的合著关系，并支持按第一、中间和末位作者角色筛选。 |

网页还提供全局论文检索、中英文切换、可调整的图谱与详情分栏、节点相关论文列表，以及包含论文属性、分类路径、双语摘要和双语 AI Summary 的论文详情页。

## 数据来源与筛选

本项目基于作者另行部署的本地 **PaperManage agent** 的交付结果工作。PaperManage 提供初始语料，包括：

- 100 篇在检索截止日前五年内公开、较具代表性的原创实证、方法或理论研究；
- 10 篇早于该时间窗口、对后续研究具有持续影响的经典论文。

初始语料经过候选发现、标题与摘要初筛、论文身份核验、合法全文获取、Docling 全文抽取和原文证据复核等阶段。后续 13 篇论文用于填补 Techniques 分类树中缺少代表论文的分支，不改变原始 100+10 名单。完整标准与各阶段数量见[论文筛选方法](docs/paper-selection-methodology.md)。

论文 PDF 与 Docling 抽取的全文 Markdown **不包含在本仓库中**，也不是运行网页所必需的。本仓库已包含网页使用的结构化论文属性、英文摘要及中文翻译、双语 AI Summary、分类数据和研究问题图数据。PaperKnowledgeBase 仅作为本地只读原文来源。

## 本地运行

前端使用原生 HTML、CSS 和 JavaScript，无需 Node.js 或前端构建工具。数据构建脚本使用独立的 Conda 环境 `interpret-vis`。

### 1. 获取项目并创建环境

```bash
git clone https://github.com/ZhaoyueSun/llm-interpretability-kb.git
cd LLM-Interpretability-KB
conda env create -f environment.yml
```

如果环境已存在，可按当前依赖文件更新：

```bash
conda env update -n interpret-vis -f environment.yml --prune
```

### 2. 生成网页派生数据

```bash
conda run -n interpret-vis python scripts/build_author_network.py
conda run -n interpret-vis python scripts/build_web_data.py
```

作者网络中间文件生成于 `.generated/`，并继续由 Git 忽略。可直接供网页使用的最终数据生成于 `web/.generated/knowledge-base.json`，该文件纳入 Git，使仓库克隆后即可运行网页。两者均可由正式数据重建，不应作为事实来源。

### 3. 启动本地网页

```bash
conda run -n interpret-vis python -m http.server 4173 --directory web
```

在浏览器访问 [http://localhost:4173/](http://localhost:4173/)。

## 目录结构

```text
.
├── data/                 # 论文、作者、语料清单、taxonomy 与分类事件等正式数据
│   ├── papers/           # 每篇论文一个 YAML 文件
│   └── taxonomies/       # Techniques、Target Objects、Applications 分类树
├── docs/                 # 筛选方法、数据模型、写作规范、审计和可视化设计文档
├── schemas/              # 正式数据与派生数据的 JSON Schema
├── scripts/              # 导入、审计、校验和网页数据构建脚本
├── tests/                # 数据与构建逻辑测试
├── web/                  # 静态前端；.generated/ 保存本地生成的网页数据
├── imports/              # 本地交付暂存目录，不纳入 Git
├── environment.yml       # interpret-vis Conda 环境定义
├── AGENTS.md             # 数据维护与 agent 协作规范
└── PROJECT_CHARTER.md     # 项目目标、边界与数据管理原则
```

`data/` 是正式事实来源；网页 JSON、作者图和搜索索引均为可重建的派生结果。关于数据字段和更新流程，参见[数据模型](docs/data-model.md)与各主题写作规范。
