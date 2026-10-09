# 项目数据模型

本项目使用少量、可由 Git 审查的文件维护论文事实和高阶分析。PDF 与 Docling 全文位于 PaperKnowledgeBase，不属于本仓库的数据。

## 数据来源

PaperManage 提供最终论文名单、筛选过程、论文信息、入选原因和知识库索引。原始交付放在本地 `imports/` 暂存目录中，不加入 Git。正式数据只保留稳定 handoff ID 和条目序号，不依赖 import 文件路径长期存在。

导入后的正式数据只有以下几类：

- `data/corpus.yaml`：正式 corpus 的成员、Core 或 Classic 身份及入选原因。
- `data/papers/<paper_id>.yaml`：单篇论文事实和双语 abstract。
- `data/authors.yaml`：跨论文作者身份与别名。
- `data/taxonomies/*.yaml`：树结构和各节点的双语综述式介绍。
- `data/classification-events.jsonl`：论文与节点关系的已批准变更历史。
- `data/classification-proposals.yaml`：等待审批或已处理的分类与 taxonomy 提案。
- `data/citations.jsonl`：带来源和日期的引用数快照。

## Corpus

`data/corpus.yaml` 是论文集合的成员清单。基础集合由 100 篇 `core` 和 10 篇 `classic` 组成；后续为覆盖 taxonomy 缺口而加入的论文属于 `supplement`，不会改写原有身份。Corpus 保存版本、全部 PaperManage handoff 来源、各分组范围、组内展示顺序、候选池排名、入选原因和原始交付条目序号。

成员身份不写入论文文件，因为它描述的是论文与本项目 corpus 的关系，而不是论文本身的事实。

Corpus 不复制标题、作者、facet、tag、绝对路径或全文抽取状态。这些信息分别由单篇论文数据、原始 PaperManage 交付和只读知识库负责，避免多个位置重复维护。

## Paper

每篇论文使用一个 YAML 文件。论文文件包含：

- 稳定 `paper_id`；
- 英文标题；
- 年份、venue 和标识符；
- 链接；
- 有顺序的作者及论文发表时的机构；
- 英文 abstract 原文与中文翻译；
- abstract 来源和翻译状态；
- PaperKnowledgeBase record 引用；
- 导入与核验 provenance。

论文文件不包含 Core 或 Classic 身份、taxonomy 节点、当前引用数或作者图统计。

## Author

`data/authors.yaml` 为跨论文作者提供稳定 ID、规范姓名、别名、外部 ID、自报当前机构、作者主页、Google Scholar 主页和消歧状态。当前机构优先来自公开 ORCID employment、已确认 Google Scholar 主页或作者及机构的官方页面；机构与主页必须保存来源和核验日期。Wikidata 只在其记录与已确认的 ORCID、OpenAlex 或 Semantic Scholar ID 一致时用于发现主页和 Google Scholar ID。OpenAlex 等聚合服务的 last-known institution 只用于发现和审计，不直接写成当前机构。无法通过已知论文、可信主页或稳定外部标识确认的候选不得写成已核实事实。引用数、h-index 等易变且平台口径不同的指标不进入作者正式数据。

论文文件仍保存该论文发表时的作者顺序和机构，因为作者可能更换机构。作者表中的当前机构不能反向覆盖论文发表时的机构。

## Taxonomy

一个 taxonomy 文件对应一个网页主题。节点构成树，每个节点保存：

- 稳定 `node_id`；
- 唯一英文标题；
- `parent_id`；
- 英文和中文介绍；
- 节点状态和替代关系；
- 建立或修改该节点的批准提案引用。

介绍文本采用 Markdown，并允许 LaTeX。网页语言开关只切换节点介绍和论文 abstract；标题统一保持英文。

## Classification Event

论文和节点的关系可以随 taxonomy、论文分析和人工判断变化。正式关系使用追加事件表示：

- `assign`：新增关系；
- `revoke`：撤销已有关系；
- `replace`：用新关系替换旧关系；
- `confirm`：在重新审核后确认关系继续有效。

事件保存理由、证据、taxonomy 版本、对应提案和被替代事件。网页当前状态由事件流计算，旧事件不删除。

## Proposal

LLM 对 taxonomy 或分类关系提出的修改先写入 `data/classification-proposals.yaml`。提案带有 `pending`、`approved` 或 `rejected` 状态。只有用户批准后，才能修改正式 taxonomy 或追加 classification event。

## Citation Snapshot

引用数随时间变化。`data/citations.jsonl` 每行保存一次带来源和日期的快照，网页使用最新可用记录，历史记录继续保留。

## 派生数据

作者图、taxonomy 节点论文列表、当前分类关系、搜索索引和网页 JSON 均从正式数据生成。它们不进入上述事实文件，也不允许手工反向同步。
