# 可视化与 Taxonomy 迭代交接

本文档面向后续负责网页可视化、论文分析和 taxonomy 迭代的 agent。它记录已经确认的数据语义与交互约束，不预设尚未选择的前端框架、图布局算法或部署方式。

## 必读顺序

1. `AGENTS.md`：项目边界和强制维护规则；
2. `PROJECT_CHARTER.md`：已确认需求和尚待讨论事项；
3. `docs/data-model.md`：事实数据、高阶分析和派生数据的职责；
4. `data/model-families.yaml`：模型族选择器与论文归属；
5. `data/taxonomies/techniques.yaml` 与 `data/taxonomies/research-object.yaml`：两棵正式分类树；
6. `data/classification-events.jsonl` 与 `data/classification-proposals.yaml`：已批准关系和待审关系。

## 当前正式状态

- Corpus 共 123 篇：100 core、10 classic、13 supplement。
- Techniques taxonomy 为 active version 2，共 77 个节点；其 123 个 primary 和 124 个 secondary 关系已进入事件流。
- Research Objects taxonomy 为 active version 1，共 69 个节点；其 123 个 primary 和 160 个 secondary 关系已由 `cp_20261009_research_objects_v1_123` 批准并进入事件流。
- 模型族定义位于 `data/model-families.yaml`，共 9 个视图；每篇论文恰好有一个 primary model family，并可有 secondary families。
- Research Objects 的旧 110 篇草案 `tp_20261009_research_objects_v1` 已被拒绝并由 v2 取代。旧草案中的 Interpretability Artifacts 分支不得用于正式视图。

## 三个正交维度

可视化必须保持以下三个维度分离：

| 维度 | 回答的问题 | 正式来源 |
|---|---|---|
| Research Objects | 研究的是什么？ | `data/taxonomies/research-object.yaml` |
| Techniques | 如何观察、验证或改变它？ | `data/taxonomies/techniques.yaml` |
| Model Family | 对哪类模型使用这些名称与对象？ | `data/model-families.yaml` |

Probe、lens、SAE、transcoder、crosscoder 和 attribution method 是 Techniques，不是 Research Objects。以 probing 为例，probe 是读出方法，被研究对象可以是 residual-stream state、component output 或 recurrent state。类似地，SAE 是分解技术，sparse dictionary feature 才是它产生并研究的表征对象。

## Research Objects 的稳定主树

```text
Research Objects
├── Data, States, and Representations
│   ├── Data Units
│   ├── Representation States
│   ├── Linear Directions and Vectors
│   ├── Subspaces, Manifolds, and Geometry
│   └── Learned Features
├── Scores and Predictions
├── Native Model Components
│   ├── Routing and Selection Components
│   ├── Transformation Components
│   ├── Memory and State Components
│   ├── Normalization Components
│   └── Native Units
├── Model Parameters
├── Composed Mechanisms
└── Learning Processes
```

这棵树不以 Transformer 为默认骨架。架构共有概念放在稳定的通用分支，架构特化名称作为叶节点，并由 `applicable_model_families` 控制显示。节点的 `applicable_object_roles` 说明它可作为 input、internal、output、structural 或 process 对象；角色是元数据，不应再生成一套重复节点。

必须保留下列语义区别：

- Token 是离散词表项或序列位置；Token Embedding 是由它索引或生成的连续向量。
- Image Patch 是输入区域；Patch Embedding 是该区域投影到隐藏空间后的向量。
- Feature Map 是具体样本上的空间激活；Channel / Filter 是产生这类激活的可复用原生单元。
- Component Output State 是某次前向传播产生的值；Attention Head、MLP Module 等是产生值的可复用组件。
- Localized Parameter Set 是被定位为控制某行为的一组模型权重，而不是 localization method 的输出名称。

## 模型族选择器

页面左上角设置单选模型族控制。默认值为 `All Models`，它不是数据中的额外 family，而是“不施加模型族过滤”的视图状态。选项从 `data/model-families.yaml` 读取：

- General / Cross-Architecture
- Transformer LM
- RNN
- CNN
- Vision Transformer
- Vision–Language
- State-Space / Mamba
- Sparse MoE
- Diffusion

相对原始示意图，新补充或拆分出的 family 包括 General / Cross-Architecture、RNN、Vision Transformer 和 Vision–Language；Mamba 使用更一般的 State-Space family 名称。Sparse MoE、State-Space 与 Diffusion 当前没有 primary corpus paper，但仍保留视图定义，目的是正确表达分类结构并支持未来论文，而不是暗示当前已有覆盖。

### 节点显示规则

1. `All Models` 显示所有 active 节点。
2. 选中具体 family 时，显示没有 `applicable_model_families` 的通用节点，以及显式包含该 family 的节点。
3. 只要某个后代可见，其祖先必须保留，以维持路径和布局稳定。
4. 隐藏节点不得更换 `node_id`、复制节点或生成另一棵 taxonomy。
5. 论文过滤使用 model-family primary 与 secondary 关系；默认突出 primary，用户可以切换为“包括 secondary”。
6. 选择器只改变视图和论文集合，不改变正式数据。

### 架构特化示例

| 通用位置 | Transformer LM | Vision Transformer | CNN | Vision–Language | State-Space | MoE | Diffusion |
|---|---|---|---|---|---|---|---|
| Input representation | Token Embeddings | Patch Embeddings | Pixels / Input Channels | Visual Tokens | Token Embeddings | Token Embeddings | Pixels / Patches |
| Internal state | Residual-Stream States | Residual-Stream States | Feature Maps | Visual Tokens + Residual States | State-Space States | Expert Output States | Denoising Latents |
| Routing / selection | QK Routing | QK Routing | — | Cross-Modal Attention | Selective Gates | MoE Routers | Attention where present |
| Transformation | MLP/FFN | MLP/FFN | Convolutional Layers | Modality Projectors + Transformer blocks | State Update Modules | Expert Networks | Denoising Blocks |
| Native unit | MLP Neurons | MLP Neurons | Channels / Filters | inherited units | State Channels | Expert Units | Channels / attention units |
| Output score | Token Logits | Class Scores | Class Scores | Similarity or Token Scores | Token / task output | inherited output | Denoising Predictions |

这张表是显示映射，不是新的分类事实。某些混合模型可能同时匹配多个 family，因此论文可以有 secondary family；节点本身仍只在 Research Objects 树中定义一次。

`Scores and Predictions` 必须始终保留。引入模型族选择器并不会使 output score 无法分类：选择 Transformer LM 时显示 Token Logits，选择 CNN 或 Vision Transformer 时显示 Class Scores，选择 Vision–Language 时还可显示 Similarity Scores，选择 Diffusion 时显示 Denoising Predictions。通用的 Regression Predictions 不限定模型族。

## 论文—节点关系

- 每篇论文在每棵 taxonomy 中恰好有一个 `primary` 关系。
- 同一论文可以有零个或多个 `secondary` 关系。
- 节点详情默认先列 primary papers，再列 secondary papers；不能把两者合并成无法辨认的计数。
- 父节点论文数由后代当前有效关系聚合得到，不写回 taxonomy 文件。
- 正式关系由 `data/classification-events.jsonl` 重建；pending proposal 只能在明确标记的预览模式中显示。

## 13 篇 supplement 的影响

复核结果是不需要增加新的顶层分支，但需要扩充叶节点：

- Transcoder Features 与 Crosscoder Features；
- Independent Components；
- Concept-Aligned Features；
- Parameter Deltas and Task Vectors；
- Feature Maps 与 Channels and Filters；
- Weight Matrices and Kernels。
- Input Features，用于 SHAP 与 FastSHAP 研究的结构化输入变量。

这些论文与其余 110 篇一起进入同一份 123 篇 Research Objects 分类提案，不能维护成一套独立补丁列表。

## 可视化数据边界

正式来源包括 corpus、paper records、authors、model families、taxonomies、classification events 与 proposals。作者图、当前分类关系、节点论文列表、搜索索引、前端 JSON、图布局坐标和视觉剪枝结果全部是可重建派生数据，不得反向覆盖 `data/`。

Taxonomy 节点变更或介绍的实质修改必须先形成提案并获用户批准。论文分类同样先进入 proposal；批准后才能追加事件，不得修改已有事件。网页技术栈、最终布局、部署方式和 proposal 是否支持交互编辑仍待后续决定。
