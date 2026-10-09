# 可视化与 Taxonomy 迭代交接

本文档面向后续负责网页可视化、论文分析和 taxonomy 迭代的 agent。它说明工作方式和数据边界，不预先规定尚未讨论的页面布局、图形样式、前端框架或部署方案。

## 必读顺序

开始工作前依次阅读：

1. `AGENTS.md`：项目边界和强制维护规则；
2. `PROJECT_CHARTER.md`：已确认需求和尚待讨论事项；
3. `docs/data-model.md`：事实数据、高阶分析和派生数据的职责；
4. `web/README.md`：目前已确认的网页要求；
5. `schemas/`：正式数据格式；
6. `data/corpus.yaml`、`data/papers/` 和 `data/taxonomies/`：当前正式数据。

## 当前状态

- 基础 corpus 已确定为 100 篇 core papers 和 10 篇 classic papers；后续论文以 `supplement` 身份增量加入，不改写基础名单身份。
- `data/papers/` 保存全部基础与增补论文对象，包含基础属性、英文 abstract 和中文翻译。
- `data/taxonomies/research-object.yaml` 目前只是空的 draft，尚未形成正式节点结构。
- `data/classification-events.jsonl` 尚无正式论文—节点关系。
- `data/classification-proposals.yaml` 尚无待审提案。
- 网页技术栈、具体布局和部署方式尚未确定。

## 核心工作方式

Taxonomy 与可视化不是先后完成的两个阶段，而是在实际研究中共同演化：

```text
浏览论文 → 观察聚类和缺口 → 提出 taxonomy 或归类调整
   ↑                                  ↓
继续使用平台 ← 批准变更并重新生成可视化
```

网页首先应成为辅助研究当前 corpus 论文的工作台。用户需要借助平台查看论文、比较相关工作、检验分类是否合理，并在此过程中继续调整可视化设计。不要等待 taxonomy 完全定稿后才开始网页工作，也不要为了完成网页而过早冻结 taxonomy。

## 首个可用闭环

第一阶段应优先打通最小垂直切片，而不是一次性完成全部页面：

1. 从正式数据加载并浏览全部论文；
2. 展示英文标题、论文属性和可切换的中英 abstract；
3. 加载一个粗粒度、允许继续演化的 taxonomy；
4. 展示节点介绍和节点当前关联的论文；
5. 能识别未分类、重复归类或分类存疑的论文；
6. 将结构与归类修改记录为提案；
7. 用户批准后更新正式数据；
8. 重新构建派生数据并刷新可视化。

这里描述的是功能闭环，不是页面布局要求。论文列表、节点介绍和图形各自位于何处，需在实际使用中继续讨论。

## Taxonomy 更新规则

- 一个可视化主题对应 `data/taxonomies/<taxonomy_id>.yaml`。
- 节点使用稳定 `node_id`；英文标题保持唯一，标题不做中英双版本。
- 节点介绍保存英文和中文版本，使用 Markdown，并允许 LaTeX。
- 节点可以随着分析被新增、移动、合并、废弃或修改介绍。
- 任何节点结构变化或正文实质性修改，必须先进入 `data/classification-proposals.yaml`。
- 未批准的提案可以用于研究性预览，但不得伪装成正式 taxonomy。
- 用户批准后，才修改正式 taxonomy，并递增 taxonomy 版本。
- 已被引用的节点不要直接改换 `node_id`；合并或替代应保留废弃状态和替代关系。

## 论文归类更新规则

论文与 taxonomy 节点的关系属于可变分析判断，不是论文基础事实：

- 不得把 taxonomy 节点直接写入 `data/papers/<paper_id>.yaml`；
- 正式关系通过 `data/classification-events.jsonl` 的追加事件形成；
- 支持 `assign`、`revoke`、`replace` 和 `confirm`；
- 已存在的事件不得删除或覆盖；
- 当前有效关系由完整事件流计算；
- 每项事件必须包含理由、证据、提案引用和对应 taxonomy 版本。

分析论文时可以读取 PaperKnowledgeBase 中的 PDF 和 Docling 全文作为证据，但该知识库只读，材料不得复制到本仓库或提交 Git。

## 可视化的数据边界

以下内容是正式来源：

- Corpus 成员关系：`data/corpus.yaml`；
- 论文事实与双语 abstract：`data/papers/`；
- 作者身份：`data/authors.yaml`；
- Taxonomy 结构和双语介绍：`data/taxonomies/`；
- 已批准论文归类：`data/classification-events.jsonl`；
- 待审或已处理提案：`data/classification-proposals.yaml`。

以下内容应由构建过程生成，不是事实来源：

- 作者合作图；
- 节点对应的论文列表；
- 当前有效分类关系；
- 搜索索引；
- 面向前端的 JSON 或其他缓存；
- 图布局坐标和视觉剪枝结果。

派生数据必须能够从正式来源重建，不得反向覆盖 `data/`。

## 已确认的产品要求

- 网站包含多个主题页面或 tab，每个主题可对应一张图；
- taxonomy 页面采用树状分支结构；
- 点击任意节点可以查看相关论文；
- 节点具有中英两版综述式介绍，并支持 LaTeX 渲染；
- 论文详情页展示论文属性及中英 abstract；
- 全站提供中英文切换，论文标题、taxonomy 标题和节点标题保持英文；
- 作者连接图从 corpus 和作者数据自动生成；
- 作者节点大小反映其在 corpus 中的出现频率；
- 作者之间的边表示共同论文；
- 作者图允许视觉剪枝，例如隐藏从未作为第一作者或最后作者出现的作者；
- 点击作者可以查看其相关论文。

除 Research Objects 和作者连接图外，其他主题页面仍待研究。Research Methods、Mathematical Foundations 等只能作为候选方向，不能视为已确定页面。

## 实施原则

- 数据读取、派生数据生成和可视化渲染应相互分离。
- Taxonomy 改动不应要求手工修改页面代码。
- 新增论文后，作者图和其他纯派生视图应能自动更新。
- 对 taxonomy 的未批准设想应与正式视图明确区分。
- 不要在技术栈确定前加入不必要的框架和依赖。
- 如需 Python，必须为本项目使用独立 Conda 环境，不得修改 `base`。
- 每完成一个可验证阶段，先运行相关校验，再创建 Git commit 并推送到远程仓库。

## 尚待用户共同决定

- 第一版 taxonomy 的具体节点与粒度；
- 新主题页面的数量和名称；
- 图、论文列表、节点介绍及详情之间的具体布局；
- Taxonomy 提案在网页中只读预览，还是需要交互式编辑能力；
- 前端技术栈、构建方式和部署平台；
- 大规模扩展论文后采用的图布局和剪枝策略。

遇到这些问题时，应优先构建便于用户比较和判断的最小实现，再根据实际使用反馈提出选项；不要把尚未讨论的选择写成既定需求。
