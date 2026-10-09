# Application and Experimental Scenarios taxonomy review v2

Status: approved and materialized

Proposal: `tp_20261009_application_scenarios_v2`

Corpus: 123 papers

## 判定原则

这棵树只回答一个问题：**论文的实验数据在测试什么任务或行为场景？**

- `primary`：支撑论文核心实证结论的主要任务类型；每篇论文恰好一个。
- `secondary`：主实验或因果验证中实际使用的其他任务类型；允许多个。
- SAE、probing、patching、attribution、circuit discovery、steering 属于 Techniques，不进入本树。
- attention head、neuron、residual stream、feature、representation 属于 Research Objects，不进入本树。
- faithfulness、方法评测、training dynamics、representation geometry 是研究目标或贡献类型，不是应用场景。
- 如果论文只在通用文本上做 next-token prediction 或 feature analysis，归入 `General Language Modeling`；如果有意跨多个互不相同的任务族，归入 `Cross-Domain Task Suites`；如果数据专门为隔离机制而生成，归入 `Synthetic Controlled Tasks`。

## 分类树与 primary 覆盖

```text
Application and Experimental Scenarios — 123
├── General Experimental Settings — 45
│   ├── Cross-Domain Task Suites — 20
│   ├── General Language Modeling — 18
│   └── Synthetic Controlled Tasks — 7
├── Language, Knowledge, and Interaction — 32
│   ├── Factual Recall and Editing — 7
│   ├── Context Use and In-Context Learning — 11
│   ├── Knowledge Conflict and Contextual QA — 2
│   ├── Language Understanding and Linguistic Tasks — 7
│   ├── Multilinguality and Language Control — 3
│   └── Sentiment, Persona, and Social Behavior — 2
├── Reasoning and Formal Tasks — 18
│   ├── Mathematics and Arithmetic — 11
│   ├── Logic and Symbolic Reasoning — 4
│   ├── Games and Rule-Based Worlds — 3
│   └── Code — 0
├── Trustworthiness and Alignment — 10
│   ├── Safety, Refusal, and Jailbreaks — 3
│   ├── Truthfulness and Deception — 3
│   ├── Bias and Fairness — 2
│   ├── Backdoors and Model Security — 2
│   └── Sycophancy and Social Alignment — 0
├── Vision and Multimodal Tasks — 18
│   ├── Visual Recognition and Grounding — 7
│   ├── Vision-Language Question Answering — 6
│   ├── Visual Reasoning and Counting — 3
│   └── Multimodal Hallucination and Grounding — 2
└── Scientific Applications — 0
    └── Science and Domain Tasks — 0
```

审批依据与完整关系位于 `data/classification-proposals.yaml`，正式树位于 `data/taxonomies/application-scenarios.yaml`，
批准后的关系已追加到 `data/classification-events.jsonl`。当前共 123 个 primary 和 128 个 secondary；
所有关系都指向叶节点，且没有论文在同一节点同时拥有 primary 与 secondary。

## 数据集到任务的判定示例

| 论文实验 | 数据集或输入 | 实际任务 | 分类结果 |
|---|---|---|---|
| *Have Faith in Faithfulness* | IOI、Gender Bias、Greater-Than、Capital-Country、SVA、Hypernymy | 共指、偏见、数值比较、事实检索、句法一致与词汇关系的多任务评测 | primary: `Cross-Domain Task Suites`; secondary: 对应具体任务叶节点 |
| *Sparse Autoencoders Enable Scalable...* | IOI、Greater-Than、Docstring | 共指/上下文检索、数值比较、代码补全 | primary: `Cross-Domain Task Suites`; 不是“SAE evaluation” |
| *How Transformers Learn Causal Structure...* | 随机因果序列、Markov chain、n-gram 合成任务 | 受控的 in-context 因果结构学习 | primary: `Synthetic Controlled Tasks`; secondary: `Context Use and In-Context Learning` |
| *Massive Values in Self-Attention...* | GSM8K、AQuA、IMDB、passkey retrieval、Cities 与合成事实 QA | 上下文理解，同时覆盖数学、情感、检索与事实回忆 | primary: `Context Use and In-Context Learning`; 多个 secondary |
| *Towards Interpreting Visual Information...* | COCO Detection | 对象存在识别与图像到文本信息传递 | primary: `Vision-Language Question Answering`; secondary: `Visual Recognition and Grounding` |
| *Dual Pathway Circuits...* | POPE-adversarial、POPE random/popular、AMBER | 视觉对象、属性与关系幻觉 | primary: `Multimodal Hallucination and Grounding` |
| *Mechanistic Interpretability of CoT...* | SVAMP | 多步数学文字题与算术推理 | primary: `Mathematics and Arithmetic`; “activation patching”只是 technique |
| *Measuring Monosemanticity...* | MiniImageNet，DINOv3/CLIP/BLIP-2 | 图像概念识别与删除 | primary: `Visual Recognition and Grounding`; “monosemanticity”不是 scenario |

## 对上一版的关键修正

- 删除 `General Interpretability and Explanation`、`Interpretability Evaluation and Auditing`、`Learning and Representation Dynamics` 三个伪场景。
- 原先归入“方法评测”的论文，改按真实 benchmark 分类。例如 *Towards Principled Evaluations of Sparse Autoencoders* 使用 IOI，因此归入上下文使用；视觉 SAE 论文使用 MiniImageNet，因此归入视觉识别。
- 原先因论文标题或研究对象落入“通用解释”的论文，改按任务处理。例如 RAVEL 使用实体属性任务，归入事实回忆；Sparse Feature Circuits 使用 subject–verb agreement，归入语言理解任务。
- VLM 不自动等于 `Vision-Language Question Answering`。只有实验任务确实要求图文交互时才进入该分支；POPE/AMBER 则进入更具体的多模态幻觉分支。
- `Code`、`Sycophancy`、`Science` 当前没有 primary 论文；只有在实验确实涉及代码补全、sycophancy 干预、ECG/EEG 或科学问答时才记录为 secondary。

## 落库状态

v1 已标记为被替代，v2 已批准。正式 taxonomy 版本为 1；123 个 primary 和 128 个 secondary
均已作为 `assign` 事件追加到事件流，后续修订继续使用 `revoke`、`replace`、`assign` 或 `confirm`，不覆盖历史。
