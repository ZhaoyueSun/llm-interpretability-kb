# Scripts

本目录保存确定性脚本，包括 PaperManage 交付适配、数据校验、当前分类关系计算、作者图构建和网页数据构建。

## `build_corpus.rb`

根据 PaperManage 的基础 JSON 交付生成 `data/corpus.yaml`。脚本只复制正式成员关系、组内展示顺序、候选池排名、入选理由、稳定 handoff ID 和原始条目序号，不复制标题、作者、taxonomy、import 路径、绝对路径或全文状态。

脚本使用 Ruby 标准库，不需要安装项目依赖。默认输入和输出分别是：

```text
imports/2026-10-08__llm-interpretability-final-corpus.json
data/corpus.yaml
```

也可以通过两个位置参数指定输入和输出路径。

## `merge_corpus_supplement.rb`

将 PaperManage 的 `taxonomy-supplement` 交付增量合并到现有 corpus。新增论文进入独立的 `supplement` 组，不改变原有 core 和 classic 身份；脚本同时记录新增 handoff 来源并递增 corpus 版本。重复执行同一份完整交付不会重复添加论文，部分重叠则停止并要求人工检查。

脚本默认输入为：

```text
imports/2026-10-09__llm-interpretability-taxonomy-supplement.json
```

## `audit_abstracts.rb`

检查 PaperKnowledgeBase metadata 中的英文 abstract 是否可以在对应 Docling 全文中得到支持。报告规范化精确匹配数和 token 覆盖率低于 95% 的待审论文，不修改任何数据。

## `build_papers.rb`

根据 PaperManage manifest 与只读 metadata 创建缺失的 `data/papers/<paper_id>.yaml`，并建立初始 `data/authors.yaml`。脚本不会覆盖已经存在的论文文件，以免破坏中文翻译或人工补充信息。

初始作者 ID 根据交付中的作者姓名确定，`disambiguation_status` 为 `unreviewed`；作者别名合并和机构补充需后续单独审核。

## `enrich_authors.py`

从 corpus 中已经确认的论文出发，在 OpenAlex 和 Semantic Scholar 的对应论文记录中匹配作者，补充外部作者 ID、自报的当前机构、作者主页和可明确确认的 Google Scholar 主页。脚本不按姓名单独猜测作者身份，也不抓取或保存引用数、h-index 等易变指标。

原始响应和审计报告保存在 Git 忽略的 `imports/` 中。默认只生成报告；确认结果后使用 `--apply` 更新 `data/authors.yaml`：

```text
conda run -n interpret-vis python scripts/enrich_authors.py
conda run -n interpret-vis python scripts/enrich_authors.py --include-semantic-scholar --include-wikidata --apply
```

默认使用 OpenAlex 以及其中已确认 ORCID 的公开自报主页。若 Semantic Scholar 的公共接口可用，可追加 `--include-semantic-scholar` 补充其作者主页数据；`--include-wikidata` 会使用已经确认的 ORCID、OpenAlex 或 Semantic Scholar ID 反查官方主页和 Google Scholar ID。接口限流不会阻塞默认流程。

## `build_author_network.py`

从当前 corpus、论文作者顺序和 `data/authors.yaml` 生成完整且不做视觉剪枝的作者合作网络。节点包含 corpus 内论文、第一作者论文、中间作者论文、末位作者论文、合作者及加权合作次数；边保存两位作者共同署名的论文及共同论文数。

默认输出是 Git 忽略的 `.generated/author-network.json`。它是可重复生成的派生数据，不作为作者或论文事实来源：

```text
conda run -n interpret-vis python scripts/build_author_network.py
```

输出格式由 `schemas/author-network.schema.json` 约束。

## `audit_research_question_edges.rb`

读取 `docs/research-question-graph-draft.yaml` 中的概念演化边，在只读的
PaperKnowledgeBase Docling 全文中查找较晚论文对较早论文的标题或作者—年份引用候选。
报告只用于人工核对：检出引用不自动证明所提议的 RQ 关系成立，未检出也不证明不存在引用。

```text
ruby scripts/audit_research_question_edges.rb > imports/research-question-edge-citation-audit.md
```

可用第一个位置参数覆盖默认的 PaperKnowledgeBase records 目录。

## `validate_research_question_graph.rb`

校验 RQ 工作草案的节点、论文覆盖、首次提出时间、边方向和关系证据等级。它要求
corpus 中每篇论文恰有一个 primary RQ，并阻止时间倒置的演化边进入后续可视化数据。

```text
ruby scripts/validate_research_question_graph.rb
```

## `discover_research_question_edge_candidates.rb`

跨全部 corpus 论文扫描正文引用，列出尚未进入 RQ 图的潜在节点关系。输出只是人工审核队列，
不会自动新增边，也不会把作者—年份字符串匹配当成历史继承证据。

```text
ruby scripts/discover_research_question_edge_candidates.rb
```
