# Interpretability Research Questions Timeline — Working Draft

## 文档定位

本文件记录 `data/corpus.yaml` 中全部论文的 research question（RQ）阅读结果，供后续构建“按问题首次提出时间定位”的研究演化图使用。当前是工作稿，不属于已批准 taxonomy，也不改变正式分类关系。

跨论文合并后的 RQ 节点、节点介绍、相关论文和概念演化边位于
`docs/research-question-graph-draft.yaml`；抽取、合并及与 Techniques、Research Objects、
Applications 保持正交的规则位于 `docs/research-question-graph-methodology.md`。

每篇论文保留两个层次：

- **论文级 RQ**：尽量忠实地重构作者在正文中实际试图回答的问题，保留论文的对象、条件和证据边界。
- **标准化时间轴 RQ**：抽去特定模型、数据集和实现细节，将问题改写为可与其他论文合并、继承或分叉的时间轴节点。

抽取以 PaperKnowledgeBase 中的 Docling 全文为依据，至少核对引言/问题设定、方法与实验目标、讨论/结论/限制，不根据 abstract 单独生成。时间采用 `earliest_public_date`；只有年份而无月日时，保留其原始精度。

---

## 2016

### 2016-10-05 — Understanding intermediate layers using linear classifier probes

- `paper_id`: `p_2016_alain_understanding_intermediate_layers`
- `group`: classic
- **论文级 RQ**：深度分类网络中的类别相关表示如何随层数和训练过程变化？在不影响原模型的前提下，线性分类 probe 能否测量各层表示的线性可分性、刻画各层作用，并诊断仅凭最终 loss 难以发现的训练异常？
- **标准化时间轴 RQ**：如何非侵入式地测量任务相关信息在网络内部各层的可访问性及其演化？

## 2017

### 2017-04-19 — Network Dissection: Quantifying Interpretability of Deep Visual Representations

- `paper_id`: `p_2017_bau_network_dissection_quantifying`
- `group`: classic
- **论文级 RQ**：CNN 中看似对应物体、部件、材质等概念的单元是否反映真实的、轴对齐的解缠结结构，还是可由任意基变换产生的表象？如何量化这种单元级可解释性，并判断网络架构、训练数据和训练方法如何影响它？
- **标准化时间轴 RQ**：如何量化表示空间与人类概念的对齐，并检验这种可解释性是否是表示基底的真实结构而非坐标假象？

### 2017-05-22 — A Unified Approach to Interpreting Model Predictions

- `paper_id`: `p_2017_lundberg_a_unified_approach`
- `group`: supplement
- **论文级 RQ**：多种局部预测解释方法之间有什么共同结构？能否把它们统一为 additive feature attribution，并在一组理想性质下确定唯一的特征归因解，同时设计适用于不同模型的高效近似方法？
- **标准化时间轴 RQ**：局部特征归因能否建立统一的形式化定义、理想性质与唯一解？

## 2018

### 2018-10-08 — Sanity Checks for Saliency Maps

- `paper_id`: `p_2018_adebayo_sanity_checks_for`
- `group`: classic
- **论文级 RQ**：视觉上合理的 saliency map 是否真的依赖模型学到的参数和真实的数据—标签关系？模型参数随机化与标签随机化能否作为通用 sanity checks，界定各种解释方法能够和不能够支持的用途？
- **标准化时间轴 RQ**：如何用反事实扰动或随机化检验解释方法是否忠实于被解释模型及其训练数据？

## 2019

### 2019-08-13 — Attention is not not Explanation

- `paper_id`: `p_2019_wiegreffe_attention_is_not`
- `group`: classic
- **论文级 RQ**：此前用替代 attention distribution 否定“attention 可以解释”的实验，是否采用了与原模型不一致或缺少基线的判据？在区分 plausible explanation 与 faithful explanation 后，如何通过 attention 必要性、跨随机种子变异、诊断模型和模型一致的对抗训练来评估 attention 的解释价值？
- **标准化时间轴 RQ**：在什么解释定义和反事实约束下，内部权重或中间量可以被视为有效解释？

### 2019-09-08 — Designing and Interpreting Probes with Control Tasks

- `paper_id`: `p_2019_hewitt_designing_and_interpreting`
- `group`: classic
- **论文级 RQ**：probe 的高语言任务准确率究竟说明表示编码了语言结构，还是说明 probe 自身学会或记忆了任务？随机 control task 和 selectivity 能否衡量这种混淆、指导 probe 复杂度选择，并支持更可靠的跨层比较？
- **标准化时间轴 RQ**：如何区分表示中可读出的信息与解释器自身学习或记忆出来的能力？

## 2020

### 2020-05-02 — Probing the Probing Paradigm: Does Probing Accuracy Entail Task Relevance?

- `paper_id`: `p_2020_ravichander_probing_the_probing`
- `group`: classic
- **论文级 RQ**：从表示中能够高准确率解码某种语言属性，是否意味着模型在完成主任务时实际使用了该属性？在主任务被构造为不需要该属性时，预训练词向量、偶然编码和随机噪声仍会不会产生较高 probing accuracy？
- **标准化时间轴 RQ**：信息“可解码”是否意味着它对模型行为“被实际使用”，以及如何区分二者？

### 2020-11-30 — Feature Learning in Infinite-Width Neural Networks

- `paper_id`: `p_2020_yang_feature_learning_in`
- `group`: supplement
- **论文级 RQ**：既然 NTK 极限基本不学习新特征，是否存在其他稳定且非平凡的无限宽参数化，能够保留真实神经网络的 feature learning？如何分类这些极限、精确计算其训练动力学，并验证其对依赖特征学习任务的解释力？
- **标准化时间轴 RQ**：如何建立既可解析又保留表征学习动力学的宽网络理论？

### 2020-12-29 — Transformer Feed-Forward Layers Are Key-Value Memories

- `paper_id`: `p_2020_geva_transformer_feed_forward`
- `group`: classic
- **论文级 RQ**：Transformer 中占据大量参数却较少被研究的 feed-forward layers 实际承担什么功能？它们能否被解释为由输入模式触发、写入输出分布的 key-value memories，以及这些 memories 如何跨层组合并逐步形成最终预测？
- **标准化时间轴 RQ**：Transformer 的前馈子层存储和调用什么信息，它们如何参与逐层构造输出？

## 2021

### 2021-03-29 — Transformer visualization via dictionary learning: contextualized embedding as a linear superposition of transformer factors

- `paper_id`: `p_2021_yun_transformer_visualization_via`
- `group`: classic
- **论文级 RQ**：能否把不同 Transformer 层的 contextualized embeddings 分解为同一组稀疏 transformer factors，从而在不预先指定 probing task 的情况下发现词义消歧、句法模式和长程依赖，并定位这些结构在层间如何形成？
- **标准化时间轴 RQ**：能否用无监督稀疏分解发现并定位表示中的未知、可解释因素，而不局限于预设的 probing 假说？

### 2021-04-18 — Knowledge Neurons in Pretrained Transformers

- `paper_id`: `p_2021_dai_knowledge_neurons_in`
- `group`: classic
- **论文级 RQ**：预训练 Transformer 的事实知识具体存储在哪里、通过哪些 FFN neurons 表达？能否以 attribution 找到与特定事实稳定相关的 knowledge neurons，并通过抑制、增强或修改这些 neurons 验证和编辑相应知识？
- **标准化时间轴 RQ**：模型中的特定事实知识能否被定位到可干预的内部单元，并通过干预验证其因果作用？

### 2021-06-06 — Causal Abstractions of Neural Networks

- `paper_id`: `p_2021_geiger_causal_abstractions_of`
- `group`: classic
- **论文级 RQ**：神经网络的低层计算是否实现了某个可解释的高层因果过程？能否通过提出高层 causal model、搜索神经表示与高层变量的 alignment，并用 interchange interventions 验证二者反事实行为一致，从而给出系统性的因果解释？
- **标准化时间轴 RQ**：如何验证神经网络是否实现了一个给定的高层可解释因果模型？

### 2021-07-15 — FastSHAP: Real-Time Shapley Value Estimation

- `paper_id`: `p_2021_jethani_fastshap_real_time_shapley`
- `group`: supplement
- **论文级 RQ**：能否把 Shapley value estimation 变成一个 amortized learning problem，使 explainer 在单次前向传播中产生准确归因，而无需预先计算昂贵的 ground-truth Shapley labels？如何降低训练方差并保持 efficiency 等公理性质？
- **标准化时间轴 RQ**：如何在保留理论归因目标的同时，将高成本解释计算摊销为实时预测？

### 2021-12-01 — Inducing Causal Structure for Interpretable Neural Networks

- `paper_id`: `p_2021_geiger_inducing_causal_structure`
- `group`: core
- **论文级 RQ**：已知一个具有领域知识的高层 causal model 时，能否不只事后检验神经网络是否实现它，而是通过 interchange intervention training 主动使网络获得相同的反事实因果结构？这种结构约束是否同时改善系统性泛化和可解释性？
- **标准化时间轴 RQ**：如何把人类指定的高层因果结构直接注入神经网络训练，使可解释结构成为学习目标？

## 2022

### 2022-02-10 — Locating and Editing Factual Associations in GPT

- `paper_id`: `p_2022_meng_locating_and_editing`
- `group`: core
- **论文级 RQ**：GPT 中的事实关联由哪些 token positions 和 modules 在前向计算中介导？因果追踪定位到的中层 MLP 计算是否可以被解释为事实存储位置，并通过 rank-one weight update 定向改写事实且尽量保持 specificity 与 generalization？
- **标准化时间轴 RQ**：语言模型中的事实关联在哪里被计算，以及能否依据这种定位对单个事实进行局部、可控的参数编辑？

### 2022-04-23 — CLIP-Dissect: Automatic Description of Neuron Representations in Deep Vision Networks

- `paper_id`: `p_2022_oikarinen_clip_dissect_automatic_description`
- `group`: supplement
- **论文级 RQ**：能否利用预训练视觉—语言模型，在不需要像素级概念标注、固定概念词表或额外训练的情况下，自动为视觉网络的单个 neurons 生成开放词汇描述，并比既有 neuron-labeling 方法更准确高效？
- **标准化时间轴 RQ**：如何以开放词汇、低人工成本的方式自动命名和检查神经网络内部单元的语义？

### 2022-06-07 — From Attribution Maps to Human-Understandable Explanations through Concept Relevance Propagation

- `paper_id`: `p_2022_achtibat_from_attribution_maps`
- `group`: supplement
- **论文级 RQ**：仅显示“哪里重要”的局部 attribution map 如何扩展为同时说明“模型识别了什么概念、这些概念在哪里、又如何组合成该次预测”的解释？能否将 local attribution 与 global concept analysis 统一为 sample-specific 的概念级解释？
- **标准化时间轴 RQ**：如何把输入级归因与内部概念语义结合，形成既局部又全局、可被人理解的预测机制解释？

### 2022-09-21 — Toy Models of Superposition

- `paper_id`: `p_2022_elhage_toy_models_of`
- `group`: core
- **论文级 RQ**：神经网络是否会在有限维激活空间中用非正交方向表示多于神经元数量的 features，即真实采用 superposition？特征稀疏性、重要性和非线性如何决定 monosemantic 与 polysemantic 表示之间的相变及其几何结构？
- **标准化时间轴 RQ**：为什么神经元会多义化，网络在容量受限时如何以 superposition 分配表示维度？

### 2022-09-24 — In-context Learning and Induction Heads

- `paper_id`: `p_2022_olsson_in_context_learning`
- `group`: core
- **论文级 RQ**：induction heads 是否是 Transformer 中大部分 in-context learning 的主要内部机制？小型 attention-only 模型中的明确回路，能否通过训练相变的共现与共扰动、直接消融、抽象行为实例和跨尺度连续性推广到含 MLP 的大型模型？
- **标准化时间轴 RQ**：一个涌现能力能否被归因于具体、可干预且跨模型尺度复现的内部计算回路？

### 2022-10-04 — Polysemanticity and Capacity in Neural Networks

- `paper_id`: `p_2022_scherlis_polysemanticity_and_capacity`
- `group`: core
- **论文级 RQ**：loss function 在什么条件下激励 polysemanticity？把每个 feature 获得的表示维度份额形式化为 capacity，是否可以解释 features 为何被忽略、获得独占维度或以 superposition 共享维度，以及 sparsity 与 importance 如何决定这些状态？
- **标准化时间轴 RQ**：优化目标如何在有限表示容量下分配特征，并由此产生 monosemanticity、忽略与 polysemantic superposition？

### 2022-10-24 — Emergent World Representations: Exploring a Sequence Model Trained on a Synthetic Task

- `paper_id`: `p_2022_li_emergent_world_representations`
- `group`: core
- **论文级 RQ**：只接受 Othello move sequences、以 next-token prediction 训练的 Transformer，是否会形成对当前棋盘状态的内部 world representation，而非只记忆表面统计？这种表示是什么形态，并且是否因果参与下一步预测？
- **标准化时间轴 RQ**：纯序列预测训练能否自发形成生成过程的内部世界状态表示，并在行为上实际使用它？

### 2022-11-01 — Interpretability in the Wild: a Circuit for Indirect Object Identification in GPT-2 small

- `paper_id`: `p_2022_wang_interpretability_in_the`
- `group`: core
- **论文级 RQ**：GPT-2 small 如何通过一组 attention heads 完成 indirect object identification？能否以 path patching 等干预发现端到端回路、解释各组件的信息路由角色，并用 faithfulness、completeness 与 minimality 检验这份回路解释？
- **标准化时间轴 RQ**：能否把预训练语言模型的一项自然行为完整地还原为经因果干预验证的端到端组件回路？

### 2022-12-07 — Discovering Latent Knowledge in Language Models Without Supervision

- `paper_id`: `p_2022_burns_discovering_latent_knowledge`
- `group`: core
- **论文级 RQ**：当模型输出可能受错误训练目标影响时，能否不使用标签或模型答案，仅凭互为否定的陈述在隐藏表示中应满足的逻辑一致性，无监督地恢复模型的 latent knowledge 或 truth representation？
- **标准化时间轴 RQ**：能否利用知识或真值的结构约束，从隐藏表示中无监督地读出模型知道但未必说出的信息？

### 2022-12-08 — Editing Models with Task Arithmetic

- `paper_id`: `p_2022_ilharco_editing_models_with`
- `group`: supplement
- **论文级 RQ**：fine-tuned weights 与 pretrained weights 的差是否形成可运算的 task vector？对这些向量做 negation、addition 和 analogy arithmetic，能否在无需重新训练或访问原数据的情况下删除行为、组合任务或迁移能力，同时限制对控制任务的损害？
- **标准化时间轴 RQ**：模型参数差分是否编码可组合的任务方向，并可通过向量运算实现模块化行为编辑？

### 2022-12-28 — Mechanism of feature learning in deep fully connected networks and kernel machines that recursively learn features

- `paper_id`: `p_2022_radhakrishnan_mechanism_of_feature`
- `group`: supplement
- **论文级 RQ**：深层全连接网络训练时究竟通过什么机制选择和增强预测相关 features？各层 weight Gram matrix 是否由相应输入上的 average gradient outer product 刻画，并能否据此统一解释 spurious features、simplicity bias、grokking 与 pruning，乃至让 kernel machines 递归学习特征？
- **标准化时间轴 RQ**：能否用可计算的动力学规律解释网络在训练中如何选择、重加权并逐层学习特征？

## 2023

### 2023-01-10 — Does Localization Inform Editing? Surprising Differences in Causality-Based Localization vs. Knowledge Editing in Language Models

- `paper_id`: `p_2023_hase_does_localization_inform`
- `group`: core
- **论文级 RQ**：Causal Tracing 所定位的事实信息位置，是否真的预测在哪一层进行 knowledge editing 最有效？定位强度与编辑成功是否相关、局部化位置是否必要或最优，以及在何种修改后的编辑目标下二者才可能重新一致？
- **标准化时间轴 RQ**：因果定位回答的“信息在哪里被使用”是否能够推出“在哪里修改行为最好”？

### 2023-01-11 — Causal Abstraction: A Theoretical Foundation for Mechanistic Interpretability

- `paper_id`: `p_2023_geiger_causal_abstraction_a`
- `group`: core
- **论文级 RQ**：一个人类可理解的高层算法在什么条件下才是神经网络低层机制的 faithful interpretation，而非 just-so story？因果抽象理论如何扩展到分布式、重叠和非线性的 neural features，并统一表述 probing、ablation、subcircuit analysis 等机制解释主张？
- **标准化时间轴 RQ**：机制可解释性中的高层算法解释，需要满足什么形式化的跨层因果对应条件才算忠实？

### 2023-01-12 — Progress measures for grokking via mechanistic interpretability

- `paper_id`: `p_2023_nanda_progress_measures_for`
- `group`: core
- **论文级 RQ**：看似突然出现的 grokking 是否由模型内部更平滑的机制变化驱动？通过逆向工程 modular addition circuit，能否构造在 test accuracy 跃迁之前连续变化且与泛化因果相关的 progress measures，并解释 memorization、circuit formation 与 cleanup 三阶段？
- **标准化时间轴 RQ**：能否用内部机制指标提前揭示并解释表面上突发的能力相变？

### 2023-02-06 — A Toy Model of Universality: Reverse Engineering How Networks Learn Group Operations

- `paper_id`: `p_2023_chughtai_a_toy_model`
- `group`: core
- **论文级 RQ**：在不同有限群、架构和随机训练运行中，网络是否收敛到相同的 group-composition 算法与 representation-theoretic circuits？universality 应理解为具体 features/circuits 均相同的强形式，还是仅共享抽象算法原则的弱形式？
- **标准化时间轴 RQ**：相同任务上的不同网络会复现同一具体机制，还是只共享更高层的算法结构？

### 2023-02-24 — Analyzing And Editing Inner Mechanisms of Backdoored Language Models

- `paper_id`: `p_2023_lamparth_analyzing_and_editing`
- `group`: core
- **论文级 RQ**：由 poisoned fine-tuning 形成的语言模型 backdoor 在 embeddings、attention 与 MLP modules 中如何实现？能否定位其关键早层机制，并用低秩 principal-component projection replacement 验证、削弱、增强、插入或改变 backdoor 行为？
- **标准化时间轴 RQ**：隐蔽触发行为由哪些内部机制实现，能否通过机制定位对其进行可控验证和编辑？

### 2023-03-05 — Finding Alignments Between Interpretable Causal Variables and Distributed Neural Representations

- `paper_id`: `p_2023_geiger_finding_alignments_between`
- `group`: core
- **论文级 RQ**：当高层变量以跨神经元分布式子空间表示时，如何避免 localist 假设与 brute-force alignment search？能否通过 gradient-based distributed alignment search 找到使 interchange interventions 与符号算法一致的旋转子空间，并检验该子空间是否还可分解为更低层变量？
- **标准化时间轴 RQ**：如何自动发现高层因果变量与分布式神经表示之间的忠实对齐？

### 2023-03-14 — Eliciting Latent Predictions from Transformers with the Tuned Lens

- `paper_id`: `p_2023_belrose_eliciting_latent_predictions`
- `group`: core
- **论文级 RQ**：Transformer 各层是否可被理解为对 next-token latent prediction 的迭代更新？如何校正 logit lens 的表示偏差，以可靠解码层间 prediction trajectories，并检验这些中间预测是否平滑收敛、具有因果相关性且可用于异常输入检测等任务？
- **标准化时间轴 RQ**：如何忠实地读出模型各层正在形成的预测，并刻画推理结果沿深度的演化轨迹？

### 2023-04-12 — Localizing Model Behavior with Path Patching

- `paper_id`: `p_2023_goldowsky_dill_localizing_model_behavior`
- `group`: core
- **论文级 RQ**：如何把“某些计算路径中介了目标行为”的定位主张精确定义为可证伪假说，而不只列出重要 nodes？广义 path patching 能否在任意计算图上量化路径集合的充分性、指出假说误差来源并支持迭代细化？
- **标准化时间轴 RQ**：如何在路径而非单个组件层面形式化、检验和比较模型行为的因果定位主张？

### 2023-04-28 — Towards Automated Circuit Discovery for Mechanistic Interpretability

- `paper_id`: `p_2023_conmy_towards_automated_circuit`
- `group`: core
- **论文级 RQ**：高度依赖人工迭代的 circuit discovery 流程中，哪些步骤可以自动化？ACDC 等算法能否依据行为数据、metric 和 activation patching 自动抽取近似已知回路，并用统一指标比较不同自动发现方法？
- **标准化时间轴 RQ**：如何自动化从行为定义到计算子图提取的机制解释流程，并评价所发现回路的质量？

### 2023-04-28 — Dissecting Recall of Factual Associations in Auto-Regressive Language Models

- `paper_id`: `p_2023_geva_dissecting_recall_of`
- `group`: core
- **论文级 RQ**：自回归语言模型在收到 subject–relation prompt 后，如何从参数中提取并生成对应事实 attribute？subject representation 如何被 MLPs 逐层丰富、relation 如何传播，以及 attention 如何在输出位置抽取所需属性？
- **标准化时间轴 RQ**：语言模型在推理时如何沿层与 token 位置路由信息，从参数化知识中完成事实召回？

### 2023-04-30 — How does GPT-2 compute greater-than?: Interpreting mathematical abilities in a pre-trained language model

- `paper_id`: `p_2023_hanna_how_does_gpt`
- `group`: core
- **论文级 RQ**：未经专门数学训练的 GPT-2 small 如何完成 year-span greater-than prediction？哪些 attention heads、MLPs 和 neurons 构成充分的因果回路，各组件分别如何传递数字信息和实现比较计算，该回路是否跨相邻 greater-than contexts 复用？
- **标准化时间轴 RQ**：预训练语言模型自发获得的数学能力由什么内部算法和组件回路实现？

### 2023-05-02 — Finding Neurons in a Haystack: Case Studies with Sparse Probing

- `paper_id`: `p_2023_gurnee_finding_neurons_in`
- `group`: core
- **论文级 RQ**：toy models 中关于 monosemanticity、polysemanticity 和 superposition 的观察在真实大语言模型中是否存在？k-sparse probes 能否可靠定位少量相关 neurons，并区分显式特征、组合性和 superposition，同时减少高容量 probes 的记忆混淆？
- **标准化时间轴 RQ**：真实大模型中的特征以多稀疏的神经元结构表示，如何可靠发现并验证这些 feature–neuron 对应？

### 2023-05-24 — A Mechanistic Interpretation of Arithmetic Reasoning in Language Models using Causal Mediation Analysis

- `paper_id`: `p_2023_stolfo_a_mechanistic_interpretation`
- `group`: core
- **论文级 RQ**：语言模型回答基本算术问题时，operand、operator 与 result 信息如何在层和位置之间流动？是否由早层处理输入、attention 将信息传至末 token、晚层 MLP 写入结果信息，并且这一模式是否跨运算和模型复现？
- **标准化时间轴 RQ**：算术推理中的数值信息如何在 Transformer 内部被传递、组合并转化为答案？

### 2023-06-06 — Inference-Time Intervention: Eliciting Truthful Answers from a Language Model

- `paper_id`: `p_2023_li_inference_time_intervention`
- `group`: core
- **论文级 RQ**：当模型中间表示可线性区分真实与错误陈述、但标准生成仍给出错误答案时，是否存在 knowledge–generation gap？能否定位少数 truth-correlated attention-head directions，并在 inference time 沿这些方向移动激活以提高 truthful generation？
- **标准化时间轴 RQ**：如何利用隐藏表示中已有但未被输出的知识，通过推理时因果干预改变生成行为？

### 2023-07-07 — Discovering Variable Binding Circuitry with Desiderata

- `paper_id`: `p_2023_davies_discovering_variable_binding`
- `group`: core
- **论文级 RQ**：能否只指定目标子计算应满足的 causal desiderata，而无需预先给出完整 clean/corrupted 行为模板，就自动学习稀疏组件 mask？这种方法能否在 LLaMA-13B 中定位跨多种算术操作共享的 variable-value binding/copying circuitry？
- **标准化时间轴 RQ**：如何用关于目标计算的行为约束，而非完整机制假说，自动定位实现该子计算的共享回路？

### 2023-07-18 — Does Circuit Analysis Interpretability Scale? Evidence from Multiple Choice Capabilities in Chinchilla

- `paper_id`: `p_2023_lieberum_does_circuit_analysis`
- `group`: core
- **论文级 RQ**：在 70B Chinchilla 上，既有 logit attribution、attention visualization 与 activation patching 是否仍能找到 multiple-choice output-label circuit？所发现 correct-letter heads 中流动的具体信息能否被压缩为可泛化的低维语义，而不仅是在原数据分布上的组件定位？
- **标准化时间轴 RQ**：人工 circuit analysis 能否扩展到前沿规模模型，并从组件定位进一步得到跨分布成立的机制语义？

### 2023-07-27 — A Geometric Notion of Causal Probing

- `paper_id`: `p_2023_guerner_a_geometric_notion`
- `group`: core
- **论文级 RQ**：如何以内生于语言模型分布、而非依赖外部 probe family 的方式，定义线性子空间包含多少 concept information？在存在相关非概念特征时，counterfactual marginalization 与 erasure、encapsulation、stability、containment 条件能否识别并干预因果概念子空间？
- **标准化时间轴 RQ**：如何从表示几何中识别既包含目标概念、又排除相关混淆并对输出具有因果作用的子空间？

### 2023-08-03 — Multimodal Neurons in Pretrained Text-Only Transformers

- `paper_id`: `p_2023_schwettmann_multimodal_neurons_in`
- `group`: core
- **论文级 RQ**：当冻结的文本 Transformer 通过独立视觉编码器和线性投影接收图像时，跨模态语义是在投影层完成，还是由文本模型内部形成？能否找到同时响应视觉与文本概念、并对图像描述具有因果作用的 multimodal MLP neurons？
- **标准化时间轴 RQ**：分开训练的模态表示在哪里、如何实现对齐，跨模态翻译能否定位到具有因果作用的内部单元？

### 2023-08-27 — Towards Vision-Language Mechanistic Interpretability: A Causal Tracing Tool for BLIP

- `paper_id`: `p_2023_palit_towards_vision_language`
- `group`: core
- **论文级 RQ**：如何把 causal mediation/causal tracing 从纯语言模型扩展到 BLIP 一类视觉—语言模型，并定位视觉信息和问题信息在 VQA 预测中经过哪些层、模态模块与融合路径产生因果影响？
- **标准化时间轴 RQ**：如何把因果定位扩展到多模态架构，并追踪跨模态信息流？

### 2023-09-01 — Mechanism of Feature Learning in Convolutional Neural Networks

- `paper_id`: `p_2023_beaglehole_mechanism_of_feature`
- `group`: supplement
- **论文级 RQ**：卷积网络的 feature learning 是否可由 patch-level average gradient outer product（AGOP）等算子刻画？这一关系能否用于在卷积 kernel machine 中重建神经网络学到的特征并改善性能？
- **标准化时间轴 RQ**：什么数学算子刻画卷积网络中的特征学习，并能把这种机制迁移到非神经模型？

### 2023-09-02 — Emergent Linear Representations in World Models of Self-Supervised Sequence Models

- `paper_id`: `p_2023_nanda_emergent_linear_representations`
- `group`: core
- **论文级 RQ**：Othello 模型中看似非线性的棋盘状态表示，是否在改用“相对当前玩家”的正确坐标系后成为线性表示？这些线性方向是否不仅可被 probe 解码，而且可因果地改变模型预测？
- **标准化时间轴 RQ**：学得的世界状态变量是否会在合适坐标系下呈线性表示，并被模型因果性地使用？

### 2023-09-05 — Explaining Grokking Through Circuit Efficiency

- `paper_id`: `p_2023_varma_explaining_grokking_through`
- `group`: core
- **论文级 RQ**：训练损失饱和后测试性能为何仍会突然跃升？grokking 是否源于更慢学得、但参数范数更高效的泛化电路最终取代记忆电路，并由此统一解释 semi-grokking 与 ungrokking？
- **标准化时间轴 RQ**：优化过程如何在记忆电路与泛化电路之间选择，从而产生延迟泛化？

### 2023-09-09 — Neurons in Large Language Models: Dead, N-gram, Positional

- `paper_id`: `p_2023_voita_neurons_in_large`
- `group`: core
- **论文级 RQ**：Transformer FFN 中有哪些功能性 neuron 类型（如 dead、token/n-gram detector 与 positional neurons），它们随模型规模如何变化？FFN 是否不只是 key–value memory，还会主动移除当前 token 信息？
- **标准化时间轴 RQ**：Transformer FFN 由哪些功能性神经元组成，其数量与作用如何随规模演化？

### 2023-09-15 — Sparse Autoencoders Find Highly Interpretable Features in Language Models

- `paper_id`: `p_2023_cunningham_sparse_autoencoders_find`
- `group`: core
- **论文级 RQ**：稀疏自编码器能否从 superposition 中恢复过完备特征基？所得特征是否比单个神经元或 PCA components 更可解释、更单义，并对模型行为具有可验证的因果作用？
- **标准化时间轴 RQ**：无监督稀疏字典学习能否恢复被 superposition 隐藏的可解释、可干预特征？

### 2023-09-27 — Towards Best Practices of Activation Patching in Language Models: Metrics and Methods

- `paper_id`: `p_2023_zhang_towards_best_practices`
- `group`: core
- **论文级 RQ**：activation patching 的定位结论对 corruption method、评价指标和 sliding-window patching 等自由度有多敏感？Gaussian noise 与 symmetric token replacement、probability 与 logit difference 会否得出不一致结论，怎样形成更可靠的实践规范？
- **标准化时间轴 RQ**：因果定位结果对实验设计选择有多稳健，如何建立可复现、可信的 intervention 标准？

### 2023-10-02 — Representation Engineering: A Top-Down Approach to AI Transparency

- `paper_id`: `p_2023_zou_representation_engineering_a`
- `group`: core
- **论文级 RQ**：能否以群体激活中的高层表示而非单个神经元或局部电路为分析单位，系统地读取和控制 truthfulness、honesty、hallucination、utility 等安全相关状态，并形成可扩展的 top-down transparency 方法？
- **标准化时间轴 RQ**：如何读取和操纵高层表示几何，以实现可扩展的模型透明性与行为控制？

### 2023-10-12 — Circuit Component Reuse Across Tasks in Transformer Language Models

- `paper_id`: `p_2023_merullo_circuit_component_reuse`
- `group`: core
- **论文级 RQ**：Transformer 在 IOI 与 Colored Objects 等表面不同的任务中，是否复用相同的 attention heads 和算法功能？从一个任务获得的电路知识能否预测并改善另一个任务的机制分析？
- **标准化时间轴 RQ**：模型会否跨任务复用通用电路组件与计算模体？

### 2023-10-16 — Attribution Patching Outperforms Automated Circuit Discovery

- `paper_id`: `p_2023_syed_attribution_patching_outperforms`
- `group`: supplement
- **论文级 RQ**：能否用一次前向—反向传播得到的 edge attribution patching 近似逐边 activation patching，从而比 ACDC 更高效地恢复已知电路？该近似为何有效、在哪些情况下仍需与 ACDC 结合？
- **标准化时间轴 RQ**：如何用计算廉价的梯度近似扩展自动电路发现，同时保持电路恢复质量？

### 2023-10-23 — Linear Representations of Sentiment in Large Language Models

- `paper_id`: `p_2023_tigges_linear_representations_of`
- `group`: core
- **论文级 RQ**：语言模型是否沿单一线性方向表示跨语境的 sentiment，该方向是否被模型因果性地使用？情感信息是否先汇聚到标点或名词等 summarization tokens，再由专门电路读出以完成预测？
- **标准化时间轴 RQ**：抽象语义属性能否由可干预的线性方向表示，并通过信息汇聚模体参与计算？

### 2023-10-23 — Function Vectors in Large Language Models

- `paper_id`: `p_2023_todd_function_vectors_in`
- `group`: core
- **论文级 RQ**：in-context learning 的任务本身是否被编码为可从少数 causal attention heads 提取的 compact function vector？这种向量能否跨上下文触发任务、携带超出输出词汇的信息，并通过向量组合形成复合函数？
- **标准化时间轴 RQ**：模型能否把任务程序压缩为可移植、可组合且具有因果作用的内部向量？

### 2023-10-25 — Attention Lens: A Tool for Mechanistically Interpreting the Attention Head Information Retrieval Mechanism

- `paper_id`: `p_2023_sakarvadia_attention_lens_a`
- `group`: core
- **论文级 RQ**：能否学习从单个 attention-head output 到词表空间的映射，以解释各 head 向 residual stream 注入了哪些语义信息，并据此定位知识检索、错误与偏见？这种映射是否比直接使用 unembedding 更适合中间层？
- **标准化时间轴 RQ**：如何把单个注意力头的输出解码为人可理解的信息检索内容？

### 2023-10-26 — How do Language Models Bind Entities in Context?

- `paper_id`: `p_2023_feng_how_do_language`
- `group`: core
- **论文级 RQ**：语言模型如何在上下文激活中保存“哪个实体绑定哪个属性”的关系？是否存在可加、位置无关、位于结构化子空间且能跨任务迁移的抽象 binding IDs；这一机制是否随规模稳定出现？
- **标准化时间轴 RQ**：模型用什么可组合表示机制动态绑定实体与属性，以支持后续关系检索？

### 2023-11-07 — Uncovering Intermediate Variables in Transformers using Circuit Probing

- `paper_id`: `p_2023_lepori_uncovering_intermediate_variables`
- `group`: core
- **论文级 RQ**：在未知完整算法、但能提出候选中间变量时，能否通过可训练权重 mask 同时检验该变量是否被表示、是否因果参与行为，以及由哪个低层 circuit 计算？这种 circuit probing 是否比普通线性/非线性 probes 更忠实？
- **标准化时间轴 RQ**：如何从候选高层中间变量出发，定位计算它且对行为必要的低层电路？

### 2023-11-07 — The Linear Representation Hypothesis and the Geometry of Large Language Models

- `paper_id`: `p_2023_park_the_linear_representation`
- `group`: core
- **论文级 RQ**：“线性表示”作为 subspace、measurement 与 intervention 的三种定义如何形式化并彼此关联？什么 inner product 才能让表示空间的几何反映概念的因果可分性，并统一 embedding 与 unembedding representations？
- **标准化时间轴 RQ**：如何为线性表示建立统一的因果几何，使可测量性、可干预性与子空间结构相互对应？

### 2023-11-08 — Future Lens: Anticipating Subsequent Tokens from a Single Hidden State

- `paper_id`: `p_2023_pal_future_lens_anticipating`
- `group`: core
- **论文级 RQ**：单个中间 hidden state 是否编码了不止下一 token、而是更远未来的多个 token？线性映射、state transplantation 与 learned prompts 能在多大程度上把这些未来预测解码出来？
- **标准化时间轴 RQ**：单个内部状态提前承诺了多远的生成轨迹，如何将这种未来信息读出？

### 2023-12-14 — Successor Heads: Recurring, Interpretable Attention Heads In The Wild

- `paper_id`: `p_2023_gould_successor_heads_recurring`
- `group`: core
- **论文级 RQ**：执行序列递增的 successor heads 是否跨模型规模与架构反复出现，从而支持 weak universality？它们是否依赖可组合的抽象数值表示（如 mod-10 features），并在自然文本上实际降低 loss？
- **标准化时间轴 RQ**：执行相同基础算法的可解释组件及其底层特征会否跨架构、跨规模普遍复现？

## 2024

### 2024 — Copy Suppression: Comprehensively Understanding a Motif in Language Model Attention Heads

- `paper_id`: `p_2024_mcdougall_copy_suppression_comprehensively`
- `group`: core
- **论文级 RQ**：能否在整个自然语言训练分布上，而非狭窄任务中，完整解释 GPT-2 Small negative head L10H7 的主要功能？copy suppression 的 stimulus、attention 与 downstream logit effect 能解释其多少行为，并如何连接 anti-induction 与 self-repair？
- **标准化时间轴 RQ**：能否对单个模型组件给出覆盖宽分布、从输入条件到输出效应的机制性功能解释？

### 2024-01-11 — Patchscopes: A Unifying Framework for Inspecting Hidden Representations of Language Models

- `paper_id`: `p_2024_ghandeharioun_patchscopes_a_unifying`
- `group`: core
- **论文级 RQ**：能否通过把 source hidden state patch 到可配置的 target prompt/model/layer，让模型自身以自然语言解释内部表示，并统一 probing、vocabulary projection 与 intervention 等方法？该框架能否更好地解码预测、属性、实体解析过程及跨模型信息？
- **标准化时间轴 RQ**：如何用可配置的跨上下文表示移植，统一并增强对 hidden states 的表达性解码？

### 2024-02-19 — Dictionary Learning Improves Patch-Free Circuit Discovery in Mechanistic Interpretability: A Case Study on Othello-GPT

- `paper_id`: `p_2024_he_dictionary_learning_improves`
- `group`: core
- **论文级 RQ**：能否先用 dictionary learning 把 Othello-GPT 各模块输出分解为稀疏可解释 features，再利用 Transformer 的线性结构追踪 feature-to-feature contributions，从而无需 activation patching 地发现宏观电路并降低复杂度与 OOD 风险？
- **标准化时间轴 RQ**：如何在特征层面进行无需 patching、计算可扩展的电路发现？

### 2024-02-22 — How Transformers Learn Causal Structure with Gradient Descent

- `paper_id`: `p_2024_nichani_how_transformers_learn`
- `group`: core
- **论文级 RQ**：Transformer 为完成 in-context learning 所需的 causal structure（如 Markov transition 与 input–output pairing）如何从随机初始化经 gradient descent 形成？能否在简化的两层模型中解析 attention circuits 的训练动力学？
- **标准化时间轴 RQ**：实现因果结构的注意力电路如何在梯度训练中形成？

### 2024-02-22 — Fine-Tuning Enhances Existing Mechanisms: A Case Study on Entity Tracking

- `paper_id`: `p_2024_prakash_fine_tuning_enhances`
- `group`: core
- **论文级 RQ**：通用算术 fine-tuning 提升 entity tracking 时，是产生了新电路还是增强了 base model 的既有电路？共享电路如何工作，性能提升可否通过 cross-model activation patching 定位到具体子机制？
- **标准化时间轴 RQ**：fine-tuning 改写了任务机制，还是保留并强化既有电路；改进发生在哪一步？

### 2024-02-26 — Language-Specific Neurons: The Key to Multilingual Capabilities in Large Language Models

- `paper_id`: `p_2024_tang_language_specific_neurons`
- `group`: core
- **论文级 RQ**：LLM 是否存在可由 language activation probability entropy 识别的 language-specific neurons，它们如何分布并影响不同语言的处理？选择性激活或抑制这些神经元能否控制输出语言并缓解 off-target generation？
- **标准化时间轴 RQ**：多语言能力在何种语言专属内部单元中实现，这些单元能否用于因果控制输出语言？

### 2024-02-27 — Information Flow Routes: Automatically Interpreting Language Models at Scale

- `paper_id`: `p_2024_ferrando_information_flow_routes`
- `group`: core
- **论文级 RQ**：能否不用人工构造 contrastive templates 和大量 activation patching，而以 attribution 自顶向下提取单次预测的重要 information-flow subgraph？该方法是否能更快、更广地发现通用或领域专属组件，并揭示 patching 对模板选择的脆弱性？
- **标准化时间轴 RQ**：如何为任意预测快速抽取可扩展的信息流路径，而不依赖人工对照样本？

### 2024-02-27 — RAVEL: Evaluating Interpretability Methods on Disentangling Language Model Representations

- `paper_id`: `p_2024_huang_ravel_evaluating_interpretability`
- `group`: core
- **论文级 RQ**：不同 featurization/interpretability 方法能否把某一 entity attribute 与其他相关属性分离，并在新实体和新上下文中保持可定位、可干预、可泛化？如何建立统一 benchmark 比较其 faithfulness、causal efficacy 与 disentanglement？
- **标准化时间轴 RQ**：如何系统评测表示解释方法是否真正分离了可泛化、可因果操纵的概念？

### 2024-02-28 — Cutting Off the Head Ends the Conflict: A Mechanism for Interpreting and Mitigating Knowledge Conflicts in Language Models

- `paper_id`: `p_2024_jin_cutting_off_the`
- `group`: core
- **论文级 RQ**：当 parametric memory 与 external context 冲突时，冲突在何处、经何种信息流产生？late-layer memory heads 与 context heads 如何竞争，能否通过 path patching 定位并剪除特定 heads 来控制模型遵从内部或外部知识？
- **标准化时间轴 RQ**：内部记忆与外部上下文的冲突如何在信息流中形成，能否在关键机制处精确干预？

### 2024-03-26 — Have Faith in Faithfulness: Going Beyond Circuit Overlap When Finding Model Mechanisms

- `paper_id`: `p_2024_hanna_have_faith_in`
- `group`: core
- **论文级 RQ**：EAP 自动发现的电路在移除 circuit 外边后能否保持原模型行为，即是否 faithful？与已知电路的 component overlap 是否能代表 faithfulness，integrated gradients 能否改善 edge scoring 与所得电路的忠实度？
- **标准化时间轴 RQ**：自动电路发现应如何以行为忠实度而非组件重合度进行验证？

### 2024-03-28 — Sparse Feature Circuits: Discovering and Editing Interpretable Causal Graphs in Language Models

- `paper_id`: `p_2024_marks_sparse_feature_circuits`
- `group`: core
- **论文级 RQ**：能否以 SAE features 取代 polysemantic components，并用线性归因高效发现 feature-to-feature causal graphs，从而解释未知行为？这些 sparse feature circuits 能否识别并删除 spurious features，且扩展到成千上万种自动发现的行为？
- **标准化时间轴 RQ**：如何在无需预设机制假说的情况下，自动发现并编辑由可解释稀疏特征组成的因果电路？

### 2024-04-10 — What Needs to Go Right for an Induction Head? A Mechanistic Study of In-Context Learning Circuits and Their Formation

- `paper_id`: `p_2024_singh_what_needs_to`
- `group`: core
- **论文级 RQ**：induction circuits 在训练中形成需要哪些相互作用的子计算？能否通过贯穿训练过程的 causal clamping，把表面突发的 phase change 分解为平滑学习的 match、copy 等 subcircuits，并解释数据分布如何改变出现时机？
- **标准化时间轴 RQ**：突发形成的能力电路能否分解为若干平滑发展的因果子电路及其交互？

### 2024-04-24 — Improving Dictionary Learning with Gated Sparse Autoencoders

- `paper_id`: `p_2024_rajamanoharan_improving_dictionary_learning`
- `group`: core
- **论文级 RQ**：标准 SAE 的 L1 sparsity penalty 是否因把 feature detection 与 magnitude estimation 耦合而产生 shrinkage 与重建偏差？将两者解耦的 Gated SAE 能否在固定计算下改善 sparsity–fidelity Pareto frontier，同时保持 feature interpretability？
- **标准化时间轴 RQ**：如何改进稀疏特征学习，使表示分解在稀疏性、重建忠实度与可解释性之间取得更好权衡？

### 2024-05-14 — Towards Principled Evaluations of Sparse Autoencoders for Interpretability and Control

- `paper_id`: `p_2024_makelov_towards_principled_evaluations`
- `group`: core
- **论文级 RQ**：在不知道“真实特征”的情况下，如何直接、客观地评价 SAE dictionaries 对真实任务是否有用？能否借助 supervised dictionaries，从重建的必要/充分性、稀疏可控性和与因果角色一致的可解释性三方面评测，并诊断 occlusion 与 over-splitting？
- **标准化时间轴 RQ**：没有 ground-truth features 时，如何以任务因果作用和可控性原则化评测稀疏字典？

### 2024-05-17 — Identifying Functionally Important Features with End-to-End Sparse Dictionary Learning

- `paper_id`: `p_2024_braun_identifying_functionally_important`
- `group`: core
- **论文级 RQ**：以局部 activation MSE 训练 SAE 是否把容量浪费在对模型行为不重要的细节上？直接优化替换 SAE 后输出 logits 的 KL divergence，并约束 downstream reconstruction，能否以更少、更稀疏的 features 保留模型功能并减少 feature splitting？
- **标准化时间轴 RQ**：稀疏特征学习应重建局部激活，还是优先保留对模型行为真正重要的计算？

### 2024-05-21 — Sparse Autoencoders Enable Scalable and Reliable Circuit Identification in Language Models

- `paper_id`: `p_2024_o_neill_sparse_autoencoders_enable`
- `group`: core
- **论文级 RQ**：在 attention-head outputs 上训练 SAE 后，正负任务样本中特有的离散 codes 能否直接标识 circuit nodes/edges，从而绕开 metric selection 与 ablation？只用少量样本能否比既有自动方法更快、更稳健地恢复 ground-truth circuits？
- **标准化时间轴 RQ**：能否通过任务条件下的稀疏离散表征，无需归因指标和消融地识别电路？

### 2024-05-24 — Transformers Represent Belief State Geometry in Their Residual Stream

- `paper_id`: `p_2024_shai_transformers_represent_belief`
- `group`: core
- **论文级 RQ**：next-token prediction 训练是否迫使 Transformer 表示对数据生成过程 hidden states 的 belief-update meta-dynamics，而不只是局部输出分布？computational mechanics 预测的、甚至呈分形的 belief-state geometry 是否线性嵌入 residual stream？
- **标准化时间轴 RQ**：训练数据的隐状态结构如何决定模型内部的预测信念几何？

### 2024-05-28 — Knowledge Circuits in Pretrained Transformers

- `paper_id`: `p_2024_yao_knowledge_circuits_in`
- `group`: core
- **论文级 RQ**：事实、常识、语言与偏见知识是否应理解为 attention heads、MLPs 与 embeddings 协同构成的 knowledge circuits，而非孤立 knowledge neurons？这些电路如何存储、表达并跨情境使用知识，又能否指导编辑？
- **标准化时间轴 RQ**：知识是局部存于单元，还是由跨组件因果电路协同表达和调用？

### 2024-06-03 — Unelicitable Backdoors in Language Models via Cryptographic Transformer Circuits

- `paper_id`: `p_2024_draguns_unelicitable_backdoors_in`
- `group`: core
- **论文级 RQ**：能否在 Transformer 中编译只有预定 cryptographic trigger 才激活、即使 white-box 访问也无法由多项式时间方法 elicitation 的任意 backdoor behavior？这对 red-teaming、ELK、formal verification 与 mechanistic detection 的理论边界意味着什么？
- **标准化时间轴 RQ**：是否存在原则上无法通过行为诱导发现的隐蔽模型机制，解释与安全审计的计算边界在哪里？

### 2024-06-17 — Refusal in Language Models Is Mediated by a Single Direction

- `paper_id`: `p_2024_arditi_refusal_in_language`
- `group`: core
- **论文级 RQ**：chat models 的 refusal behavior 是否跨架构与规模由 residual stream 中单一方向中介？消融或加入该方向、以及 rank-one weight edit，能否分别关闭或诱发拒绝；adversarial suffix 又如何阻断其传播？
- **标准化时间轴 RQ**：复杂安全行为能否由低维线性表示中介，并因此可被精确操纵或绕过？

### 2024-06-17 — Transcoders Find Interpretable LLM Feature Circuits

- `paper_id`: `p_2024_dunefsky_transcoders_find_interpretable`
- `group`: supplement
- **论文级 RQ**：如何在 fine-grained circuit analysis 中处理 MLP 非线性而不退回 polysemantic neurons 或输入依赖的梯度近似？以稀疏宽 MLP 近似原 MLP 的 transcoders 能否提供 input-invariant feature-to-feature effects，并达到不逊于 SAE 的 fidelity 与 interpretability？
- **标准化时间轴 RQ**：如何把 MLP 非线性分解为稀疏、可解释且输入无关的特征变换，以支持特征级电路分析？

### 2024-07-01 — Efficient Automated Circuit Discovery in Transformers using Contextual Decomposition

- `paper_id`: `p_2024_hsu_efficient_automated_circuit`
- `group`: core
- **论文级 RQ**：能否把 contextual decomposition 扩展到各类 Transformer，解析任意 source activation constituent 对 target activation 的贡献，并据此在无需训练或人工构造样本的情况下，以秒级速度发现位置细粒度电路？
- **标准化时间轴 RQ**：如何用解析分解而非反复干预，高效、架构通用地发现细粒度电路？

### 2024-07-02 — Why do LLaVA Vision-Language Models Reply to Images in English?

- `paper_id`: `p_2024_hinck_why_do_llava`
- `group`: core
- **论文级 RQ**：为何向多语言 LLaVA-style VLM 加入图像会显著降低 response language fidelity？哪些训练/架构选择与内部表示造成 Image-induced Fidelity Loss，问题可否定位到 language model 并通过 hidden-state intervention 缓解？
- **标准化时间轴 RQ**：多模态输入为何扰乱语言选择，跨模态表示失配如何在模型内部形成并被纠正？

### 2024-07-19 — Jumping Ahead: Improving Reconstruction Fidelity with JumpReLU Sparse Autoencoders

- `paper_id`: `p_2024_rajamanoharan_jumping_ahead_improving`
- `group`: core
- **论文级 RQ**：能否用具有可学习正阈值的 JumpReLU 与直接 L0 penalty，减少 ReLU SAE 的 false positives 和 magnitude underestimation，在给定稀疏度下提高重建忠实度，同时保持特征可解释性并降低训练复杂度？
- **标准化时间轴 RQ**：怎样设计稀疏编码的门控与目标函数，以更有效地推进 sparsity–fidelity frontier？

### 2024-08-09 — Gemma Scope: Open Sparse Autoencoders Everywhere All At Once on Gemma 2

- `paper_id`: `p_2024_lieberum_gemma_scope_open`
- `group`: core
- **论文级 RQ**：如何把 SAE 研究从小模型或单层扩展到现代开放 LLM 的所有层与子层，并提供可复用的大规模公共基础设施？大规模 JumpReLU SAE 的训练、评测、feature splitting 与跨分布表现呈现什么规律？
- **标准化时间轴 RQ**：如何构建覆盖工业规模模型全层位的开放特征图谱，使特征级解释能够系统扩展？

### 2024-09-22 — A Is for Absorption: Studying Feature Splitting and Absorption in Sparse Autoencoders

- `paper_id`: `p_2024_chanin_a_is_for`
- `group`: core
- **论文级 RQ**：即使真实 features 线性且稀疏，层级关系是否仍会使 SAE 无法恢复它们？feature splitting 如何导致更一般特征的方向被更具体 latent 吸收、出现 precision/recall holes，且这种 absorption 在真实 Gemma Scope SAEs 中有多普遍？
- **标准化时间轴 RQ**：层级特征会如何系统性破坏 SAE 的特征恢复，怎样识别 splitting 与 absorption 造成的伪解释？

### 2024-10-09 — Towards Interpreting Visual Information Processing in Vision-Language Models

- `paper_id`: `p_2024_neo_towards_interpreting_visual`
- `group`: core
- **论文级 RQ**：LLaVA-style VLM 输入 LM 的视觉 soft tokens 如何编码物体信息：信息是否保留空间局部性、随层演化为可解释词汇方向，并在何时经 attention 被抽取到回答位置？文本模型上的机制理解能否迁移到视觉输入处理？
- **标准化时间轴 RQ**：视觉信息进入语言模型后以何种空间与语义结构表示，并沿哪些层间路径转化为文本预测？

### 2024-10-17 — On the Role of Attention Heads in Large Language Model Safety

- `paper_id`: `p_2024_zhou_on_the_role`
- `group`: core
- **论文级 RQ**：aligned LLM 的拒绝与安全能力是否依赖特定 individual/groups of attention heads？如何在需要多步生成的 safety tasks 上归因这些 heads，并判断它们是否跨同源 fine-tuned models 重合、协同工作且可与 helpfulness 分离？
- **标准化时间轴 RQ**：安全对齐由哪些注意力子电路实现，其因果作用、协同性与任务专属性如何衡量？

### 2024-10-27 — Llama Scope: Extracting Millions of Features from Llama-3.1-8B with Sparse Autoencoders

- `paper_id`: `p_2024_he_llama_scope_extracting`
- `group`: core
- **论文级 RQ**：如何为 Llama-3.1-8B 的每层 residual、attention、MLP outputs 与 transcoders 训练并开放多宽度 SAEs？改进 TopK 训练后，这些 features 的 sparsity、fidelity、interpretability、几何结构及向长上下文和 instruction model 的迁移性如何？
- **标准化时间轴 RQ**：如何在开放工业级 LLM 上建立全位置、多粒度且可迁移的稀疏特征资源？

### 2024-11-01 — Decoding Dark Matter: Specialized Sparse Autoencoders for Interpreting Rare Concepts in Foundation Models

- `paper_id`: `p_2024_muhamed_decoding_dark_matter`
- `group`: core
- **论文级 RQ**：不把通用 SAE 扩到数十亿 features，能否用 subdomain-targeted Specialized SAEs 与数据检索高效捕获极少出现的 tail concepts？Tilted ERM 能否进一步平衡 head/tail feature learning，改善稀有概念检测、解释与控制？
- **标准化时间轴 RQ**：如何在有限字典容量下发现训练分布长尾中的稀有但重要概念？

### 2024-11-02 — Enhancing Neural Network Interpretability with Feature-Aligned Sparse Autoencoders

- `paper_id`: `p_2024_marks_enhancing_neural_network`
- `group`: core
- **论文级 RQ**：SAE 可能学习并非输入真实 features 的 arbitrary split/composed directions；同一数据上多个独立 SAE 反复学到的 features 是否更可能与输入特征对齐？Mutual Feature Regularization 能否利用跨 SAE 一致性改善 feature recovery？
- **标准化时间轴 RQ**：如何利用跨训练运行的特征稳定性，约束 SAE 学到与原表示真实结构对齐的 features？

## 2025

### 2025-01-01 — Reasoning Circuits in Language Models: A Mechanistic Interpretation of Syllogistic Inference

- `paper_id`: `p_2025_kim_reasoning_circuits_in`
- `group`: core
- **论文级 RQ**：内容无关的 syllogistic reasoning 在预训练 LM 中由什么电路实现？该机制是否与 world knowledge/belief bias 解耦，并能否跨 syllogistic schemes、模型规模与架构泛化？
- **标准化时间轴 RQ**：形式推理是否由可迁移的内容无关电路实现，以及它如何被参数知识与信念偏差污染？

### 2025-01-01 — Causal Head Gating: A Framework for Interpreting Roles of Attention Heads in Transformers

- `paper_id`: `p_2025_nam_causal_head_gating`
- `group`: core
- **论文级 RQ**：如何从分布式、交互依赖的视角为所有 attention heads 赋予 facilitating、interfering 或 irrelevant 的因果角色，而不依赖人工标签、对照模板或预设功能假说？不同 tasks/models 的 sufficient subcircuits 有多分布、冗余和可变？
- **标准化时间轴 RQ**：如何可扩展地刻画注意力头在分布式计算中的条件性因果角色，而非假设组件功能固定？

### 2025-01-17 — The Intrinsic Dimension of Prompts in Internal Representations of Large Language Models

- `paper_id`: `p_2025_viswanathan_the_intrinsic_dimension`
- `group`: core
- **论文级 RQ**：以整段 prompt 的 token point cloud 而非 last-token dataset geometry 计算 intrinsic dimension，能否刻画各层内部几何与 token interactions？该维度如何关联语义结构、模型不确定性，并能否在输出前用于恶意 prompt screening？
- **标准化时间轴 RQ**：prompt 内 token 几何的有效维度能否统一表征语义组织、预测不确定性并支持生成前安全检测？

### 2025-01-28 — AxBench: Steering LLMs? Even Simple Baselines Outperform Sparse Autoencoders

- `paper_id`: `p_2025_wu_axbench_steering_llms`
- `group`: core
- **论文级 RQ**：representation-based steering 是否在开放词汇概念与长文本生成的现实规模上，真正优于 prompting、full/parameter-efficient fine-tuning 等简单控制基线？如何同时以 concept detection 与 model steering 建立可扩展的统一 benchmark？
- **标准化时间轴 RQ**：表征操纵方法在严格、现实且有强基线的评测中，是否提供实际控制优势？

### 2025-02-03 — Massive Values in Self-Attention Modules Are the Key to Contextual Knowledge Understanding

- `paper_id`: `p_2025_jin_massive_values_in`
- `group`: supplement
- **论文级 RQ**：RoPE-based LLM 的 Q/K 中为何会在各 heads 相似维度出现 concentrated massive values？这些值是否专门支撑 contextual knowledge understanding 而非 parametric retrieval，并能否解释不同 quantization 方法对上下文能力的影响？
- **标准化时间轴 RQ**：注意力中的异常大值由什么架构机制产生，它们对上下文计算承担何种功能？

### 2025-02-23 — Are Sparse Autoencoders Useful? A Case Study in Sparse Probing

- `paper_id`: `p_2025_kantamneni_are_sparse_autoencoders`
- `group`: core
- **论文级 RQ**：SAE latents 除了改善 reconstruction 等 proxy metrics，是否能在真实 probing 任务中为实践者带来超过强基线的增量价值？在数据稀缺、类别不平衡、label noise 与 covariate shift 下，这种更可解释的基底是否形成稳定优势？
- **标准化时间轴 RQ**：解释方法必须在什么下游任务和反事实基线上证明差异化实用价值？

### 2025-03-14 — Taming Knowledge Conflicts in Language Models

- `paper_id`: `p_2025_li_taming_knowledge_conflicts`
- `group`: core
- **论文级 RQ**：多种 parametric–contextual knowledge conflicts 中，attention heads 是否并非纯 memory/context heads，而以 superposition 同时编码两类信息？能否通过双次运行的 JUICE 消除这种混合影响，并在无需 fine-tuning 下双向控制知识来源？
- **标准化时间轴 RQ**：当内部与上下文知识在同一组件中叠加时，如何理解并精确控制模型采用哪一来源？

### 2025-03-21 — Language-Specific Neurons Do Not Facilitate Cross-Lingual Transfer

- `paper_id`: `p_2025_mondal_language_specific_neurons`
- `group`: core
- **论文级 RQ**：已识别的 language-specific neurons 是否真能通过 test-time activation intervention 或 targeted fine-tuning 改善低资源语言的 cross-lingual downstream transfer，而不只是影响生成语言？其 polysemanticity 是否限制了这种作用？
- **标准化时间轴 RQ**：表面语言专属的神经元是否是跨语言能力的独立因果杠杆，还是与任务信息纠缠而不可单独利用？

### 2025-03-24 — I Have Covered All the Bases Here: Interpreting Reasoning Features in Large Language Models via Sparse Autoencoders

- `paper_id`: `p_2025_galichin_i_have_covered`
- `group`: core
- **论文级 RQ**：reasoning LLM 的 uncertainty、exploration 与 reflection 是否编码为可由 SAE 和 ReasonScore 识别的稀疏方向？这些 features 是否在 reasoning fine-tuning 后出现，并可通过 steering 因果性地延长推理与提升任务表现？
- **标准化时间轴 RQ**：后训练获得的复杂推理行为能否分解为可解释、可操纵且有因果作用的稀疏特征？

### 2025-03-25 — Why Representation Engineering Works: A Theoretical and Empirical Study in Vision-Language Models

- `paper_id`: `p_2025_tian_why_representation_engineering`
- `group`: core
- **论文级 RQ**：RepE 在 VLM 中如何跨层传递并稳定保存 honesty/fairness 等高层概念，又能否抵抗跨模态失配与 hallucination？self-attention 的 principal eigenvector 与 shrinking spectral gap 是否为这种稳定和概念分化提供理论解释？
- **标准化时间轴 RQ**：高层表示为何能跨层稳定传播并支持跨模态控制，其谱结构基础是什么？

### 2025-04-03 — Overcoming Sparsity Artifacts in Crosscoders to Interpret Chat-Tuning

- `paper_id`: `p_2025_minder_overcoming_sparsity_artifacts`
- `group`: supplement
- **论文级 RQ**：crosscoder 中 base decoder norm 为零的“chat-only latent”是否真的由 chat-tuning 新增，还是 L1 sparsity 引起的 complete shrinkage/latent decoupling artifact？如何用 Latent Scaling 检出伪特征，并用 BatchTopK 更可靠地区分 shared 与 model-specific latents？
- **标准化时间轴 RQ**：模型差分工具如何避免把稀疏优化伪影误认成 fine-tuning 新增的机制？

### 2025-06-07 — Transferring Linear Features Across Language Models With Model Stitching

- `paper_id`: `p_2025_chen_transferring_linear_features`
- `group`: core
- **论文级 RQ**：若不同规模同家族模型共享部分线性表示，简单 affine model stitches 能否在其 residual spaces 间转移 SAEs、probes 与 steering vectors？这种迁移能否节省 SAE 训练计算，并揭示 semantic、structural 与 functional features 的 universality 差异？
- **标准化时间轴 RQ**：跨模型表示空间能否对齐到足以迁移解释工具和功能特征，从而检验并利用弱 universality？

### 2025-06-10 — Same Task, Different Circuits: Disentangling Modality-Specific Mechanisms in VLMs

- `paper_id`: `p_2025_nikankin_same_task_different`
- `group`: core
- **论文级 RQ**：VLM 在同构视觉与文本任务上的性能差距，是否来自两种模态使用结构不同且功能不等价的 circuits？data、query 与 generation subcircuits 中哪一部分造成差距，能否借助跨模态 circuit swapping 与层间 patching 改善视觉处理？
- **标准化时间轴 RQ**：同一任务的不同模态是否使用不同机制，性能差距能否定位到并修复特定跨模态子计算？

### 2025-09-22 — Interpreting Attention Heads for Image-to-Text Information Flow in Large Vision-Language Models

- `paper_id`: `p_2025_kim_interpreting_attention_heads`
- `group`: core
- **论文级 RQ**：LVLM 中哪些 attention heads 负责把视觉 token 信息传给语言 token，信息从哪些图像位置流向哪些文本位置？当单头消融因分布式冗余失效时，多头组合 attribution 能否更 faithful、complete 地刻画该过程？
- **标准化时间轴 RQ**：图像到文本的信息流由哪些分布式注意力组件协同实现，如何在 token 与 head 两级忠实归因？

### 2025-12-05 — A Unified Theory of Sparse Dictionary Learning in Mechanistic Interpretability: Piecewise Biconvexity and Spurious Minima

- `paper_id`: `p_2025_tang_a_unified_theory`
- `group`: core
- **论文级 RQ**：SAEs、transcoders 与 crosscoders 能否表述为统一的 sparse dictionary optimization，它的 landscape 具有何种结构？为何零 reconstruction loss 仍可能不恢复真实 features，polysemanticity、feature absorption 与 spurious partial minima 如何产生，feature anchoring 能否缓解欠定性？
- **标准化时间轴 RQ**：稀疏字典学习为何可能在完美重建下仍给出错误解释，其优化景观与可辨识性条件是什么？

## 2026

### 2026-01-01 — Mechanistic Analysis of Universality: Numerical Comparison Circuits Across Transformer Architectures

- `paper_id`: `p_2026_bhardia_mechanistic_analysis_of`
- `group`: core
- **论文级 RQ**：不同 Transformer families 与规模是否用相同内部电路完成 numerical greater-than comparison？相似行为是否对应可迁移的 localized heads 和线性信号，还是只在同家族内一致、跨架构转为更分布式机制？
- **标准化时间轴 RQ**：相同任务表现是否意味着跨架构机制 universality，还是不同模型可实现功能等价但结构不同的电路？

### 2026-01-01 — The Geometry of Refusal: Linear Instability in Safety-Aligned LLMs

- `paper_id`: `p_2026_ratnakar_the_geometry_of`
- `group`: core
- **论文级 RQ**：安全 fine-tuning 是真正删除有害知识，还是在输出附近叠加可分离的 linear refusal wrapper？通过 contrast safe/unrestricted logits 得到的 refusal vector 能否揭示 late-decision 与 early-divergence 两类安全拓扑，并被减除或反向增强？
- **标准化时间轴 RQ**：安全拒绝在网络中整合得多深，其线性可分离程度如何决定对几何干预的脆弱性？

### 2026-03-19 — Counting Circuits: Mechanistic Interpretability of Visual Reasoning in Large Vision-Language Models

- `paper_id`: `p_2026_che_counting_circuits_mechanistic`
- `group`: core
- **论文级 RQ**：LVLM 如何在 circuit level 执行视觉计数，subitizing 与大数估计的行为断裂对应什么表示几何与跨模态信息路由？能否识别 visual grounding、routing、aggregation 与 awareness heads，并通过定向干预把计数机制迁移为更一般的视觉推理增益？
- **标准化时间轴 RQ**：基础视觉计数由什么跨模态电路实现，它是否是可解释、可干预并支撑更广泛视觉推理的原语？

### 2026-03-26 — Sparse Visual Thought Circuits in Vision-Language Models

- `paper_id`: `p_2026_zhou_sparse_visual_thought`
- `group`: core
- **论文级 RQ**：视觉推理是否由可线性组合的稀疏模块组成，还是因表示几何纠缠而本质非模块化？SAE features 对推理是否因果必要且单独可 steering，而其合并为何会因 non-orthogonality 与 off-manifold drift 产生干扰？
- **标准化时间轴 RQ**：可解释视觉特征的因果真实性是否意味着可组合性，表示纠缠在哪里限制模块化控制？

### 2026-04-07 — MechELK: A Mechanistic Interpretability Framework for Eliciting Latent Knowledge in Large Language Models

- `paper_id`: `p_2026_park_mechelk_a_mechanistic`
- `group`: core
- **论文级 RQ**：如何把 SAE feature analysis、activation patching 与 representation engineering 组合成 Locate–Verify–Elicit pipeline，以提取模型内部存在但未表达的知识？怎样用 causal knowledge score 区分真实 latent knowledge 与可解码的伪相关或模型根本不知道的内容？
- **标准化时间轴 RQ**：如何以因果验证区分“模型知道但不说”与“只是相关或并不知道”，并可靠诱导潜在知识？

### 2026-05-13 — Dual-Pathway Circuits of Object Hallucination in Vision-Language Models

- `paper_id`: `p_2026_liu_dual_pathway_circuits`
- `group`: core
- **论文级 RQ**：VLM object-existence hallucination 的电路是 architecture-specific，还是跨模型共享 visual-grounding 与 hallucination 双路径？路径内组件如何交互，目标 suppression 能否因果验证该结构，并向 relational/attribute hallucination 迁移？
- **标准化时间轴 RQ**：跨架构视觉幻觉是否源于共享的竞争信息路径，其路径级交互与跨错误类型泛化如何？

### 2026-05-21 — From Correlation to Cause: A Five-Stage Methodology for Feature Analysis in Transformer Language Models

- `paper_id`: `p_2026_munigety_from_correlation_to`
- `group`: core
- **论文级 RQ**：如何把 probe design、feature extraction、causal validation、robustness testing 与 deployment integration 串成支持因果主张的完整方法学？feature selectivity、causal force、detection robustness 与 intervention robustness 之间到底是什么关系？
- **标准化时间轴 RQ**：解释性发现如何从相关候选升级为经因果、分布外和部署成本共同校准的证据？

### 2026-05-21 — Towards Verifiable Transformers: Solver-Checkable Circuit Explanations

- `paper_id`: `p_2026_somani_towards_verifiable_transformers`
- `group`: core
- **论文级 RQ**：能否把 circuit explanations 转化为 solver-checkable bounded claims，验证其在声明域内与 symbolic program 功能等价、边必要、对无关输入不变且对连续扰动稳健？当原生神经电路难以直接证明时，能否构造性地安装并校准可验证的程序电路且禁止新 bypass？
- **标准化时间轴 RQ**：如何从经验性电路发现推进到带明确适用域、反例与 proof object 的形式化机制保证？

### 2026-05-28 — Scaling Monosemanticity: Extracting Interpretable Features from Claude 3 Sonnet

- `paper_id`: `p_2026_templeton_scaling_monosemanticity_extracting`
- `group`: core
- **论文级 RQ**：稀疏字典学习能否扩展到 frontier-scale model，并仍提取可解释、抽象、跨语言/模态且能 steering 行为的 features？模型规模、concept frequency 与所需 dictionary size 之间有什么规律，安全相关特征能否被发现？
- **标准化时间轴 RQ**：单义特征提取能否扩展到前沿模型，并以何种 scaling law 覆盖更抽象、更稀有和安全相关的概念？

### 2026-06-04 — Subspace-Aware Sparse Autoencoders for Effective Mechanistic Interpretability

- `paper_id`: `p_2026_dalili_subspace_aware_sparse`
- `group`: core
- **论文级 RQ**：许多语义概念若本质是多维 manifold/subspace，标准 vector-based SAE 是否必然用大量近共线 atoms 切片表示并产生 feature splitting？把 subspace group 作为表示单位的 SASA 能否更忠实地恢复内在几何并降低训练 sample complexity？
- **标准化时间轴 RQ**：解释性基本单位应是一维方向还是多维子空间，后者能否避免结构性 feature splitting？

### 2026-06-10 — ICA Lens: Interpreting Language Models Without Training Another Dictionary

- `paper_id`: `p_2026_liu_ica_lens_interpreting`
- `group`: supplement
- **论文级 RQ**：LLM activations 的 non-Gaussian geometry 中已经显露多少可解释结构，是否无需训练大型 overcomplete SAE 即可用稳定、高效的 ICA 找到？这些 compact directions 是否兼具人工可解释性、上下文依赖与 probing/intervention utility？
- **标准化时间轴 RQ**：在投入昂贵字典学习前，能否直接从激活统计几何中提取足够有用的可解释方向？

### 2026-07-20 — Measuring Monosemanticity in Sparse Autoencoders via Latent Activation Coherence

- `paper_id`: `p_2026_filus_measuring_monosemanticity_in`
- `group`: core
- **论文级 RQ**：如何在不依赖 concept labels、auxiliary classifiers 或外部 embedding geometry 的情况下定义并衡量 SAE latent monosemanticity？基于二值 activation-set coherence 的 Tversky Monosemantic Score 能否稳定比较训练动态并预测 concept deletion 效果？
- **标准化时间轴 RQ**：如何用自包含、几何无关且与因果操纵效用相关的指标测量单义性？

### 2026-07-21 — When and Why Do Linear Bias Probes Fail? A Geometric and Statistical Theory of Bias Detectability in Large Language Model Representations

- `paper_id`: `p_2026_hai_when_and_why`
- `group`: core
- **论文级 RQ**：linear bias probe 的成功或失败如何由 class separation、manifold curvature、intrinsic dimension、signal purity 与 sample size 共同决定？怎样区分“模型无偏”与“审计统计功效不足”，并预测 counterfactual 与真实语料评测的巨大差异？
- **标准化时间轴 RQ**：probe 的空结果何时说明信息不存在，何时只是几何不可线性读取或统计功效不足？

### 2026-08-23 — Mechanistic Interpretability of Chain-of-Thought Reasoning via Sequential Activation Patching

- `paper_id`: `p_2026_dura_mechanistic_interpretability_of`
- `group`: core
- **论文级 RQ**：prompted CoT 只是改变输出表面形式，还是沿生成轨迹因果性地重组内部计算？哪些 token positions 与 attention heads 携带使 No-CoT execution 转向 CoT-like final answer 的信号，如何用 sequential activation patching 追踪其时间分布？
- **标准化时间轴 RQ**：如何把静态因果干预扩展到序列化推理过程，定位跨生成时间展开的因果计算？

### 2026-09-24 — Where Hallucinations Live: A Cross-Architecture Circuit in VQ-Tokenized Vision-Language Models

- `paper_id`: `p_2026_hegde_where_hallucinations_live`
- `group`: core
- **论文级 RQ**：unified VQ-tokenized VLM 的极端 hallucination bias 是否源于跨架构共享的 early-layer attention routing circuit？VQ bottleneck 是否为其因果来源，能否在训练前后用三门诊断识别，并通过机制定向干预改善 open-ended generation 而非只校准 binary logits？
- **标准化时间轴 RQ**：特定多模态架构选择如何系统性地产生跨模型共享的幻觉电路，机制诊断能否指导优于症状修补的干预？

### 2026-09-25 — FTB Graph: Determining and Validating First-Token Broadcasters and Language-Identity Head Circuits in Multilingual Language Models

- `paper_id`: `p_2026_pillai_ftb_graph_determining`
- `group`: core
- **论文级 RQ**：多语言模型在生成首 token 前在哪里决定目标语言，是否由少数 language-identity heads 计算并广播信号以约束后续生成？该 circuit 是否跨架构/规模复现，并在 base-to-instruct fine-tuning 中保持拓扑？
- **标准化时间轴 RQ**：生成级全局决策是否由首 token 处的小型广播电路建立，其跨模型普遍性与后训练稳定性如何？
