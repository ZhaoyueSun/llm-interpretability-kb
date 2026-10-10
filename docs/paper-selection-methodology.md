# 论文筛选方法 / Paper Selection Methodology

本文档记录当前 corpus 的来源、逐阶段筛选标准和数据边界。它根据 PaperManage 的稳定交付 `2026-10-08__llm-interpretability-final-corpus` 与 `2026-10-09__llm-interpretability-taxonomy-supplement` 整理；不依赖本地 `imports/` 路径。

## 中文

### 1. 范围与基本原则

初始语料由 100 篇 core papers 和 10 篇 classic papers 组成：

- **Core papers**：最早可验证公开日期位于 2021-10-08 至 2026-10-08 的五年窗口内。
- **Classic papers**：早于该窗口，但对近年的 LLM interpretability 研究具有可说明的持续方法或思想影响，最多 10 篇。

两组均只收录具有原创方法、理论结果或经验发现的研究论文。Survey、review、position、perspective 和纯议程型论文只用于发现候选与追踪引用，不进入最终名单。研究对象不局限于 LLM；其他神经网络或理论研究只有在方法或机制可以明确迁移到 LLM interpretability 时才具备资格。

论文是否已经存在于本地知识库、是否容易获得 PDF、是否便于可视化，以及 survey 的覆盖次数，均不参与学术质量排序。引用量只在内容判断接近时作为次级参考，并考虑论文发表时间差异。

### 2. 初始 100+10 语料的筛选阶段

| 阶段 | 数量变化 | 主要标准 |
| --- | --- | --- |
| **1. 广泛发现** | 500 篇主窗口候选；另有 44 篇经典候选 | 综合学术检索、引用网络、survey/reference 入口和已有研究线索，覆盖 circuit、component、sparse feature、probing、representation geometry、knowledge、reasoning、safety、truthfulness、steering、editing、multilingual 和 multimodal 等方向。此阶段强调召回率，不按本地库存或原始引用数排名。 |
| **2. 标题与摘要初筛** | 主窗口 500 → 173 | 保留提出原创方法、理论或内部机制发现的论文。Reasoning、editing、steering、truthfulness、safety 和 multimodal 等邻接方向，只有在内部表征、组件或计算过程是核心贡献时保留。只有行为评测、prompting、benchmark 或自然语言解释而缺少内部机制分析的工作被排除。 |
| **3. 身份核验与全文候选池** | 主窗口 173 → 150；23 篇不进入全文池 | 使用 arXiv、DOI/Crossref、出版商、会议页面或原始仓储核对论文身份和最早公开日期，去除重复、窗口外或贡献不满足条件的条目。全文池依据可审计的贡献与机制相关性确定；引用快照只用于难以区分的边界情况。经典候选在独立池中继续处理，不占 150 篇名额。 |
| **4. 合法全文获取与抽取** | 150+44 个候选记录；177 份 PDF；176 份通过校验的全文（147 篇主窗口、29 篇经典候选） | 只从合法公开来源获取 PDF，并使用 Docling 高质量模式抽取全文。要求标题层级可用、正文内容充分、编码完整，且不存在仅按页生成标题等结构性错误。不接受快速文本提取作为正式全文替代；没有通过全文校验的论文不进入最终选择。 |
| **5. 原文证据复核与定稿** | 176 → 100 篇 core + 10 篇 classic | 阅读研究目标、方法、实验、结果、消融、结论与局限，按贡献类型判断证据。去除贡献高度重复、机制主张缺少支持或增量有限的论文；同一贡献簇优先保留更早提出核心方法、证据更强、影响更广，或显著扩展范围、加强验证、提出不同结论的工作。经典论文还必须能说明其对近五年研究的具体影响。 |

### 3. 按贡献类型审查证据

- **因果机制发现**：检查 activation/path patching、ablation、intervention、对照实验和替代解释排除。
- **表征、几何与流形发现**：检查分析对象和度量是否定义清楚，结果是否跨层、模型或设置稳定，是否控制混淆因素，以及内部结构能否解释或预测模型行为。
- **理论研究**：检查假设、推导和结论是否清楚且非平凡，是否产生可检验或可证伪的结果，以及与模型内部计算的联系是否具体。
- **新分析方法**：检查 synthetic ground truth、已知机制或其他可靠参照上的验证，与已有方法的比较，以及对超参数和实现选择的稳健性。
- **描述性发现**：允许没有因果干预，但必须呈现可重复、非平凡的内部结构发现，并明确区分相关性证据与已证明的机制。

### 4. Techniques taxonomy 的 13 篇补充论文

初始版本完成后，项目审查了 Techniques 分类树中缺少代表论文的分支，并新增 13 篇 supplement papers。这批论文不改变原始 100 篇 core 和 10 篇 classic 的成员关系，也不参与原始名额排序。

补充流程包括：

1. **缺口识别**：只考虑尚无 primary paper 实质覆盖的技术分支，或需要保留其历史来源的细粒度叶节点；不收录 survey、review 或 position-only 论文。
2. **身份核验与去重**：通过 arXiv ID、规范化标题和稳定来源核对身份，确保与现有 corpus 不重复。
3. **入库与合法 PDF 获取**：为每篇论文建立稳定 `paper_id` 和元数据记录，从公开合法来源获取并校验 PDF；动态引用快照不参与纳入决策。
4. **全文抽取与完整性审计**：使用与初始语料相同的 Docling 高质量流程，并要求全文 Markdown 的结构、内容和编码通过校验。

### 5. 仓库与原文边界

本仓库保存 corpus 成员关系、论文属性、英文摘要和中文翻译、双语 AI Summary、taxonomy、分类事件和研究问题图。论文 PDF 与 Docling 全文保存在独立的本地 PaperKnowledgeBase 中，不复制到本仓库，也不提交 Git。前端由仓库内的正式结构化数据生成，不依赖用户拥有该本地全文库。

---

## English

### 1. Scope and principles

The initial corpus contains 100 core papers and 10 classic papers:

- **Core papers:** the earliest verifiable public release falls within the five-year window from 8 October 2021 through 8 October 2026.
- **Classic papers:** released before that window but with a specific, continuing methodological or conceptual influence on recent LLM interpretability research; capped at 10.

Both groups are restricted to original research with a methodological, theoretical, or empirical contribution. Surveys, reviews, position papers, perspectives, and agenda-only work may support candidate discovery and citation tracing but are not eligible for final membership. The research object need not be an LLM: work on other neural architectures or theory is eligible only when its mechanism or method clearly transfers to LLM interpretability.

Local knowledge-base availability, PDF convenience, suitability for visualization, and survey coverage do not contribute to scholarly ranking. Citation counts are used only as a secondary signal for otherwise close decisions and are interpreted relative to publication age.

### 2. Selection stages for the initial 100+10 corpus

| Stage | Funnel | Main criteria |
| --- | --- | --- |
| **1. Broad discovery** | 500 in-window candidates plus 44 classic candidates | Academic search, citation networks, surveys and reference works, and existing research leads were used to cover circuits, components, sparse features, probing, representation geometry, knowledge, reasoning, safety, truthfulness, steering, editing, multilingual, and multimodal research. This stage prioritized recall and did not rank by local availability or raw citation count. |
| **2. Title and abstract screening** | 500 → 173 in-window candidates | Papers had to contribute an original method, theory, or internal-mechanism finding. Adjacent areas such as reasoning, editing, steering, truthfulness, safety, and multimodality were retained only when internal representations, components, or computation were central. Behavior-only evaluation, prompting, benchmarks, or natural-language explanations without internal analysis were excluded. |
| **3. Identity verification and full-text pool** | 173 → 150 in-window candidates; 23 did not enter the pool | Identities and earliest release dates were checked against arXiv, DOI/Crossref, publisher or conference pages, or original repositories. Duplicates, out-of-window papers, and papers that failed the contribution criteria were removed. Full-text selection relied on auditable contribution and mechanism relevance; citation snapshots broke ties only. Classic candidates continued in a separate pool and did not consume the 150-paper allocation. |
| **4. Lawful acquisition and extraction** | 150+44 candidate records; 177 PDFs; 176 verified full texts (147 in-window and 29 classic candidates) | PDFs came from lawful public sources and were processed with high-quality Docling extraction. Usable heading structure, sufficient content, encoding integrity, and the absence of page-heading fallback artifacts were required. Fast text extraction was not accepted as a formal substitute, and candidates without verified full text were ineligible for the final selection. |
| **5. Full-text evidence review and finalization** | 176 → 100 core + 10 classic papers | Review covered the research objective, method, experiments, results, ablations, conclusions, and limitations. Papers with highly redundant contributions, unsupported mechanism claims, or limited incremental value were removed. Within a contribution cluster, preference went to the earliest core method, stronger evidence, broader influence, or a meaningful extension, stronger validation, or conflicting result. Classic papers additionally required a specific link to developments in the recent five-year window. |

### 3. Evidence standards by contribution type

- **Causal mechanism discovery:** activation/path patching, ablation, intervention, controls, and the exclusion of alternative explanations.
- **Representation, geometry, and manifold findings:** clear definitions of objects and metrics; stability across layers, models, or settings; confound controls; and an ability to explain or predict behavior.
- **Theory:** explicit and non-trivial assumptions, derivations, and conclusions; testable or falsifiable consequences; and a concrete connection to internal model computation.
- **New analysis methods:** validation against synthetic ground truth, known mechanisms, or another reliable reference; comparison with prior methods; and robustness to hyperparameters and implementation choices.
- **Descriptive findings:** causal intervention is not mandatory, but the internal structure must be reproducible and non-trivial, and correlational evidence must be distinguished from a demonstrated mechanism.

### 4. The 13-paper Techniques supplement

After the initial release, the project audited Techniques branches that lacked representative papers and added 13 supplement papers. They do not alter membership in the original 100 core and 10 classic sets and were not ranked against those quotas.

The supplement followed four stages:

1. **Gap identification:** only a technique branch without substantive primary-paper coverage, or a fine-grained leaf whose historical source needed preservation, was eligible. Surveys, reviews, and position-only papers were excluded.
2. **Identity verification and deduplication:** arXiv IDs, normalized titles, and stable source records were checked to prevent duplication with the existing corpus.
3. **Ingest and lawful PDF acquisition:** each paper received a stable `paper_id` and metadata record, and its PDF was acquired from a lawful public source and validated. Dynamic citation snapshots did not affect inclusion.
4. **Full-text extraction and integrity audit:** the same high-quality Docling pipeline used for the initial corpus was applied, and the structure, content, and encoding of the Markdown output had to pass validation.

### 5. Repository and full-text boundary

This repository stores corpus membership, paper metadata, English abstracts and Chinese translations, bilingual AI-generated summaries, taxonomies, classification events, and the research-question graph. PDFs and Docling full text remain in a separate local PaperKnowledgeBase and are neither copied into this repository nor committed to Git. The frontend is generated entirely from the structured source data in this repository and does not require access to the local full-text collection.
