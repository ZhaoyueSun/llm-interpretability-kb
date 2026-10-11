# Web Application

第一版使用原生 HTML、CSS 和 JavaScript，不依赖 Node.js 或前端构建工具。正式数据先由确定性 Python 脚本转换为 Git 忽略的只读 JSON，再由浏览器加载；这一实现不预设后续正式前端框架。

生成网页数据并启动本地预览：

```text
conda run -n interpret-vis python scripts/build_author_network.py
conda run -n interpret-vis python scripts/build_web_data.py
conda run -n interpret-vis python -m http.server 4173 --directory web
```

随后访问 `http://localhost:4173/`。派生文件位于 `web/.generated/knowledge-base.json`，不得作为事实来源或反向覆盖 `data/`。

完整的已确认页面结构与交互设计见 [`docs/visualization-design.md`](../docs/visualization-design.md)。

已确认的产品要求包括：

- 顶层 tab 按 `Research Questions`、`Techniques`、`Target Objects`、`Applications`、`Authors` 排列；其中 `Target Objects` 对应数据中的 `research-object` taxonomy；
- `Research Questions` 展示按首次提出时间排列的关系图，随后三个主题 tab 展示分类树，`Authors` 展示作者合作图；
- Research Questions 顶部显示年度主刻度、季度细刻度、板块颜色和关系证据线型图例；板块与 RQ 节点均可点击，右栏提供双语 Overview 与 Paper List；
- 主窗口左侧显示可视化，右侧在 `Overview` 与 `Paper List` 之间切换，左右分区可拖动调整宽度；
- 顶栏提供全站论文检索，支持标题、作者、年份、venue 与 DOI、arXiv、OpenReview 标识符，并可用 `⌘K / Ctrl+K` 或 `/` 打开；
- 顶栏提供独立 Contact 页面，链接项目 GitHub 仓库与 Issues，用于推荐论文、报告纠错或提出改进建议；
- taxonomy 使用可展开的树状结构；
- 分类树初始只展开第一层，使用 `+ / −` 逐层展开或收起，支持整图缩放及水平、垂直滚动；
- Research Objects 页面左上角提供模型族选择器；`All Models` 展示完整通用树，具体模型族依据 `applicable_model_families` 收起不适用叶节点；
- 模型族选择器只改变可见节点、术语解释与论文过滤，不改变 taxonomy 的稳定节点 ID；
- 模型族不是树根。Transformer LM、CNN、Vision Transformer、Vision–Language、RNN、State-Space / Mamba、Sparse MoE、Diffusion 与 General / Cross-Architecture 均从 `data/model-families.yaml` 加载；
- Token 与 Token Embedding、Image Patch 与 Patch Embedding 必须分别展示；前者是离散或可观测数据单元，后者是连续表征；
- Scores and Predictions 是跨模型族的固定分支，其具体叶节点随模型族展示，不能因为引入模型族选择器而从树中移除；
- 点击任意节点后展示相关论文；
- 论文与节点关系区分 primary 和 secondary；默认以 primary 组织列表，同时允许用户查看同一论文的其他实质性对象关系；
- 节点包含英文和中文两版综述式介绍；
- 节点介绍支持 Markdown 与 LaTeX；
- 论文详情在 Abstract 下方展示中英文 AI Summary，并随全站语言切换；AI Summary 中的 Markdown 强调和 LaTeX 公式应正常渲染；
- 论文详情展示属性以及英文和中文 abstract；
- 论文详情页不显示 Core、Classic 或 Supplement 标识；
- 全站提供中英文切换，用于切换 overview、abstract，以及非 taxonomy 属性和关系角色的显示名称与说明；论文标题和节点标题保持英文，属性数据键和枚举值不变；
- 论文详情的 Attributes 展示四个主题分类以及 `contribution_role`、`evidence_strength`、`modality`；后三者从 `data/controlled-vocabulary.yaml` 读取双语字段名称、取值名称和说明；
- 每条主题分类关系显示从根节点的下一层到目标节点的完整路径；`primary` 置顶，并逐行展示全部 `secondary`，共同祖先不得省略；
- 点击论文作者或主题分类时返回相应图谱并在右侧显示 overview，不创建独立作者详情页；
- 图谱与论文详情之间的导航保留来源、选中对象、滚动位置、缩放比例和展开状态；
- 作者合作图根据 corpus 自动生成；
- 作者图提供 First、Middle、Last 多选过滤，默认全部保留，并以“满足任一已选角色”的方式筛选作者及合著边；
- 第一版不包含未分类审计、争议检查、提案预览、taxonomy 编辑或审批功能；
- 当前初版已实现 Research Questions、Techniques、Target Objects、Applications、Authors 和论文详情；Research Questions 当前读取 working-draft 图数据，不将其视为正式 taxonomy；
- 正式技术框架和部署方式后续确定。
