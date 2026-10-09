# Web Application

网页技术栈尚未确定。本目录后续保存网页源代码。

已确认的产品要求包括：

- 多个 taxonomy 页面或 tab；
- taxonomy 使用可展开的树状结构；
- Research Objects 页面左上角提供模型族选择器；`All Models` 展示完整通用树，具体模型族依据 `applicable_model_families` 收起不适用叶节点；
- 模型族选择器只改变可见节点、术语解释与论文过滤，不改变 taxonomy 的稳定节点 ID；
- 模型族不是树根。Transformer LM、CNN、Vision Transformer、Vision–Language、RNN、State-Space / Mamba、Sparse MoE、Diffusion 与 General / Cross-Architecture 均从 `data/model-families.yaml` 加载；
- Token 与 Token Embedding、Image Patch 与 Patch Embedding 必须分别展示；前者是离散或可观测数据单元，后者是连续表征；
- Scores and Predictions 是跨模型族的固定分支，其具体叶节点随模型族展示，不能因为引入模型族选择器而从树中移除；
- 点击任意节点后展示相关论文；
- 论文与节点关系区分 primary 和 secondary；默认以 primary 组织列表，同时允许用户查看同一论文的其他实质性对象关系；
- 节点包含英文和中文两版综述式介绍；
- 节点介绍支持 Markdown 与 LaTeX；
- 论文详情展示属性以及英文和中文 abstract；
- 全站提供中英文切换，论文和节点标题保持英文；
- 作者合作图根据 corpus 自动生成；
- 页面具体布局、技术框架和部署方式后续确定。
