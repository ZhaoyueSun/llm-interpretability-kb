# 网页可视化设计

本文档记录已经确认的网页信息架构与交互设计。它约束第一版页面行为，但不预设前端框架、图布局实现或部署平台。

## 顶层导航

页面顶部按以下固定顺序显示五个 tab：

1. `Research Questions`
2. `Techniques`
3. `Target Objects`
4. `Applications`
5. `Authors`

其中 `Target Objects` 是界面名称，对应正式数据中的 `research-object` taxonomy。`Research Questions` 展示时间—关系图，`Techniques`、`Target Objects` 和 `Applications` 展示分类树，`Authors` 展示作者合作图。

顶层同时提供 `中文 / English` 切换。语言设置切换具有双语内容的 overview、论文 abstract，以及非 taxonomy 属性和关系角色的显示名称与说明。论文标题、taxonomy 标题和节点标题保持英文；属性数据键与枚举值也始终以英文形式存储，不因界面语言改变。论文详情页中的 abstract、属性显示名称和说明默认跟随这一全站设置。

顶栏提供全站论文检索入口，并支持 `⌘K / Ctrl+K` 和 `/` 快捷键。检索覆盖论文标题、作者、年份、venue、publication type、DOI、arXiv ID 和 OpenReview ID，支持空格分隔的多关键词组合匹配。标题命中优先排序，结果点击后直接进入现有论文详情页，并保留当前图谱作为返回上下文。

## 主窗口布局

每个图谱 tab 下方的主窗口分为左右两区：

- 左区显示 Research Question 时间—关系图、分类树或作者合作图；
- 右区在 `Overview` 与 `Paper List` 之间切换；
- 中间分隔条可拖动，以调整左右两区宽度；
- 左区画布独立滚动，右区不随画布滚动。

各 tab 独立保存展开状态、缩放比例和滚动位置。用户在论文详情页与图谱间往返时，也应恢复离开前的图谱状态。

## Research Questions

Research Questions 使用独立的时间—关系图，而不是 taxonomy 树。当前第一版读取 `docs/research-question-graph-draft.yaml` 的 working draft，仅用于浏览和评审，不代表该结构已经成为正式 taxonomy 或分类事件。

- 横轴按 RQ 的 `first_date` 定位，显示年度主刻度和季度细刻度；`RQ01` 等短码按首次提出日期确定性生成，只是显示标签，稳定标识仍为 `rq_id`；
- 六个研究板块以横向泳道组织，并使用固定颜色区分；板块是视觉组织辅助，不是 RQ 的父节点；
- 顶部只保留关系证据线型说明：实线表示 `direct-citation`，虚线表示 `same-lineage`，点线表示 `analyst-inference`；板块颜色直接用于泳道和节点，不另设颜色图例；
- 板块标题和 RQ 节点都可以点击；点击任一对象后自动切回右栏 `Overview`；
- 板块 Overview 展示双语引导问题、介绍和演化总结；RQ Overview 展示双语问题、介绍、当前进展和首次提出日期；
- Paper List 对板块聚合其全部 RQ 的论文，对单个 RQ 区分 primary papers 与 secondary papers，并支持按年份正序或倒序排列；
- 从论文详情中的 Research Questions 属性可以返回该图并定位具体 RQ，随后仍可返回原论文。

## 分类树

### 视觉形式

分类树参考学术论文中的横向层级图：

- 从左向右展开；
- 节点使用圆角矩形框，文字居中，长标题自动换行；
- 父子关系使用平滑曲线连接；
- 根节点颜色较深，后续层级使用较浅的同色系背景；
- 视觉样式参考示意图，但不复制示意图中的分类内容。

### 展开、缩放与滚动

- 分类树初始只展开第一层；
- 有子节点的节点右端显示展开控制：展开时为 `−`，收起时为 `+`；
- 叶节点不显示展开控制；
- 可在 `+` 旁显示被隐藏的后代节点数量；
- 点击节点框用于选中节点，点击 `+ / −` 只控制分支展开状态；
- 左区支持整张图缩放，节点框、文字和连线按比例变化；
- 提供缩小、放大和重置控制，并可支持鼠标或触控板缩放；
- 图超出可视区域时显示水平与垂直滚动条，允许左右和上下滚动；
- 调整左右分区宽度不改变当前展开状态和缩放比例。

### 节点右侧栏

选择节点后：

- `Overview` 展示该节点的介绍；
- `Paper List` 展示当前关联论文；
- 论文关系按正式事件流计算，并区分 `primary` 与 `secondary`；
- 点击论文进入论文详情页。

`Target Objects` 中已有的模型族选择器保留在该 tab 内。它只改变当前可见节点和论文集合，不改变稳定 taxonomy 结构。

## Authors

`Authors` tab 左区显示作者合作图，右区沿用统一的 `Overview / Paper List` 结构，不创建独立的作者个人详情页。

作者图提供 `First / Middle / Last` 多项过滤。默认全部选中；同一作者可以属于多个角色，只要作者在当前 corpus 的任意论文中担任过一个已选角色就保留。过滤只改变图中可见作者和相应合著边，不修改作者或论文数据。

选择作者后，`Overview` 展示：

- 作者姓名；
- 当前机构，仅在正式作者数据存在时显示；
- 个人主页和 Google Scholar 页面，仅在正式作者数据存在时显示；
- corpus 内论文数、第一作者论文数、末位作者论文数和合作者数；
- 按共同论文数排序的常见合作者及共同论文数量。

以上统计均从当前 corpus、论文和作者数据派生。点击常见合作者后，在作者图中切换选中对象；`Paper List` 展示该作者在 corpus 中的论文，点击论文进入论文详情页。

## 论文详情页

论文详情页采用单栏阅读结构。

### 顶部信息

- 返回进入详情页前的图谱上下文，例如 `← Back to Techniques`；
- 英文论文标题；
- 年份和最早公开日期；
- venue 与 publication type；
- 完整作者列表；
- 论文主页、PDF 和代码链接，按实际存在情况显示；
- DOI、arXiv ID 和 OpenReview ID，按实际存在情况显示。

顶部不显示 `Core`、`Classic` 或 `Supplement` 标识。

### Abstract

- 支持 `中文 / English` 切换，默认跟随全站语言设置；
- 只切换 abstract 正文，论文标题始终保持英文。

### Attributes

主题分类按顶层 tab 顺序展示：

- Research Questions
- Techniques
- Target Objects
- Applications

随后展示三个独立属性：

- `contribution_role`
- `evidence_strength`
- `modality`

主题分类不能只显示被分配节点的末端标题。每一条当前有效关系都必须展示从 taxonomy 根节点到目标节点的完整路径，例如：

```text
Primary Technique
[Technique Primitives] · [Readout and Measurement] · [Probing] · [Supervised and Sparse Probing]

Secondary Technique
[Technique Primitives] · [Causal Localization] · [Activation Patching]
```

具体规则如下：

- 每条 `primary` 或 `secondary` 关系单独占一行，不把多条关系合并成一条路径；
- `primary` 排在最前，随后完整列出所有 `secondary`，不能只显示其中一条；
- 每条路径都从根节点开始，沿 `parent_id` 展开到实际被分配的目标节点；
- 即使多条路径拥有相同前缀，也分别完整显示，不省略共同祖先；
- 路径中的每个节点框都可点击，并返回对应 taxonomy 图谱、展开路径和定位该节点；
- 路径祖先只提供分类上下文，不表示论文额外分配到了这些祖先节点；
- 如果关系目标本身是非叶节点，路径在该节点结束；
- 当前有效关系必须从完整 classification event 流计算，不能直接展示历史上已被撤销或替换的关系。

同一 taxonomy 路径规则适用于 Techniques、Target Objects 和 Applications。没有任何当前有效关系时，才显示“尚未分类”或 `Unclassified`。

Research Questions 不使用 taxonomy 路径：每条关系显示 `RQxx` 短码和随全站语言切换的问题文本，并区分主要研究问题与相关研究问题。短码仅用于展示和定位，不替代稳定 `rq_id`。

这三个属性的数据键和枚举值保持英文不变，界面使用 `data/controlled-vocabulary.yaml` 提供的本地化内容：

- 字段显示名称和字段说明解释该属性回答什么问题；
- 取值显示名称和取值说明解释当前论文所显示值的具体含义；
- 显示名称与说明均提供中文和英文两个版本，并随页面顶部的全站语言按钮切换；
- 不为属性另设语言开关，也不改变稳定的英文数据键和枚举值；
- 即使当前论文尚无取值，仍可显示字段说明，并将取值标为“尚未分类”或 `Unclassified`。

说明应避免把属性误读为论文质量排名。例如，`contribution_role` 描述论文作出了哪类贡献，`evidence_strength` 描述论文支持机制主张所达到的证据层级，`modality` 描述研究所覆盖的数据或模型模态。

Techniques 标签使用同一词汇表中的 `Primary Technique / 主要技术` 与 `Secondary Technique / 辅助技术` 显示名称和说明。内部关系值仍为 `primary` 与 `secondary`。

非 taxonomy 属性没有正式数据时同样显示“尚未分类”或 `Unclassified`，不得生成推测性标签。

点击作者姓名时，切换到 `Authors` tab，在图中定位并选中该作者，右侧打开 `Overview`。点击主题分类节点时，切换到对应 taxonomy tab，展开并定位该节点，右侧打开节点 `Overview`。二者都不创建额外详情页。

### Why it is included

- 展示 `data/corpus.yaml` 中的真实入选理由；
- 默认折叠，用户可以展开查看；
- 虽然页面顶部不显示 corpus 身份标识，该区域仍然保留。

## 返回机制

从论文详情页进入作者或 taxonomy 视图时，必须保留论文来源上下文：

- 图谱页顶部显示 `← Back to [论文标题]`；
- 浏览器返回按钮也能回到论文详情页；
- 返回后恢复论文详情页原来的滚动位置；
- 在图中继续切换作者或节点时，不丢失最初的论文返回入口；
- 直接进入图谱页时不显示论文返回入口。

从图谱的 `Paper List` 进入论文详情页时同样保留图谱来源、选中对象、展开状态、缩放比例和滚动位置。

## 第一版范围

第一版是浏览和探索型可视化，不承担知识库维护与审批工作。以下功能不属于当前网页可视化范围：

- 未分类论文审计；
- 重复归类或分类争议检查；
- 待审提案预览；
- taxonomy 或分类关系编辑；
- 在网页中批准提案或写入正式事件流。

论文详情页的进一步视觉样式和排版细节留待后续讨论。
