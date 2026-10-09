# Research Objects taxonomy review v2

Status: taxonomy and paper classification approved  
Taxonomy proposal: `tp_20261009_research_objects_v2`  
Classification proposal: `cp_20261009_research_objects_v1_123`  
Corpus: 123 papers

## Main conclusion

Research Objects 应描述论文试图解释的对象，而不是所用模型族或分析工具。正式设计因此采用“稳定通用对象树 + 独立模型族视图”：模型族在 `data/model-families.yaml` 中维护，Techniques 在另一棵 taxonomy 中维护，Research Objects 只保存状态、表征、组件、参数、组合机制与学习过程。

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

正式文件共有 69 个节点，每个节点都有面向研究人员的中英文介绍。架构特化叶节点通过 `applicable_model_families` 与 Transformer LM、RNN、CNN、Vision Transformer、Vision–Language、State-Space / Mamba、Sparse MoE 和 Diffusion 视图关联；没有该字段的节点表示跨架构适用。

## 与 v1 草案的主要差异

- 删除 `Interpretability Artifacts` 分支。Probe、lens、SAE、transcoder、crosscoder、attribution 与 benchmark 属于 Techniques；其读取、分解、干预或评估的对象才属于 Research Objects。
- 将输入/输出位置改为 `applicable_object_roles`，避免同一个 representation 因角色不同而重复建节点。
- 明确区分 Token 与 Token Embedding、Image Patch 与 Patch Embedding、Feature Map 与 Channel / Filter、Component Output 与 Native Component。
- 把原来的宽泛 `Model Parameters` 展开为 Weight Matrices and Kernels、Behavior-Localized Parameter Subsets、Parameter Deltas and Task Vectors。
- 把 learned feature 展开为 Sparse Dictionary、Transcoder、Crosscoder、Independent Component 与 Concept-Aligned Feature。
- 增加 RNN、CNN、Vision Transformer、Vision–Language、State-Space、MoE 与 Diffusion 所需的架构特化叶节点，但没有把模型族放回对象树。

## 13 篇 supplement 复核

新增论文没有要求新的顶层分支。它们分别验证或促成了以下叶节点：

- Transcoder Features：`p_2024_dunefsky_transcoders_find_interpretable`（secondary；主对象是 circuit）；
- Crosscoder Features：`p_2025_minder_overcoming_sparsity_artifacts`；
- Independent Components：`p_2026_liu_ica_lens_interpreting`；
- Concept-Aligned Features：`p_2022_achtibat_from_attribution_maps`；
- Parameter Deltas and Task Vectors：`p_2022_ilharco_editing_models_with`；
- CNN Feature Maps / Channels and Filters：CLIP-Dissect、NFM/AGOP 与相关视觉论文；
- Weight Matrices and Kernels：feature-learning theory 与 massive-value 分析；
- Paths / Circuits：Attribution Patching 与 transcoder circuit work；
- Input Features：SHAP 与 FastSHAP 所归因的结构化输入变量。

因此 13 篇与原 110 篇使用同一份分类提案处理，而不是单独维护补丁。

## 分类覆盖

已批准提案为全部 123 篇提供：

- 123 个 primary Research Objects 关系，恰好每篇一个；
- 160 个 secondary 关系，无重复，也不与同篇论文的 primary 节点重复；
- 一个主对象用于默认聚类，多个次对象用于保留跨层级研究范围。

例如 probing paper 的主对象可能是 residual-stream state 或 recurrent state，而不是 probe；*Sparse Feature Circuits* 的主对象是 circuit，sparse dictionary feature 是 secondary；*Transcoders Find Interpretable LLM Feature Circuits* 的主对象也是 circuit，transcoder feature 是 secondary。

这些论文—节点关系已经写入追加式事件流。后续修订必须新增 `revoke`、`replace`、`assign` 或 `confirm` 事件，不得覆盖本次历史记录。
