# LLM Interpretability Knowledge Base Agent 指南

## 项目边界

- PaperManage 决定最终的 100 篇 core papers 和 10 篇 classic papers，并提供筛选过程、论文信息和入选原因。
- 不预设 PaperManage 的交付格式。收到真实交付物后再设计导入适配，不要求上游迁就本项目格式。
- `imports/` 是本地交付暂存目录，不加入 Git。正式数据只能保存稳定 `handoff_id`，不得依赖 import 文件路径长期存在。
- PaperKnowledgeBase 只读。不得在其中新增、覆盖、移动或删除文件。
- 不得将 PDF 或 Docling 全文复制到本仓库或提交 Git。

## 论文数据

- 每篇论文使用 `data/papers/<paper_id>.yaml` 保存。
- `paper_id` 应与 PaperManage 的正式 record 一致，不在本项目中另建 ID。
- 论文文件保存基础事实、作者顺序、机构、链接、英文 abstract、中文翻译和知识库引用。
- Core 或 Classic 身份及入选原因只在 `data/corpus.yaml` 中维护。
- taxonomy 和论文分类关系不得写入论文文件。
- 英文 abstract 与中文翻译在最终名单确定后由本项目完成，不交给 PaperManage，也不调用第三方 API。

## Taxonomy

- 一个可视化主题对应 `data/taxonomies/<taxonomy_id>.yaml`。
- taxonomy 采用树状结构。每个节点有稳定 `node_id`、英文标题、父节点、英文介绍和中文介绍。
- 标题统一使用英文，不维护中文标题。
- 节点介绍使用 Markdown 文本，并允许 `\(...\)` 行内公式和 `$$...$$` 块级公式。
- `Techniques` 节点介绍的写作、父子继承、证据边界、双语和审核标准见 `docs/technique-introduction-guidelines.md`，更新时必须遵守。
- `Application and Experimental Scenarios` 的实验任务判定、主次分类、节点介绍、双语和审批标准见 `docs/application-scenario-guidelines.md`，更新时必须遵守。
- taxonomy 节点的新增、移动、合并、废弃和正文实质性修改必须先形成提案，并经用户批准。

## 分类关系

- 论文与 taxonomy 节点的关系是可变判断，不是论文事实。
- 正式变更追加到 `data/classification-events.jsonl`，不得删除或覆盖旧事件。
- 支持 `assign`、`revoke`、`replace` 和 `confirm`。
- 未批准的操作只记录在 `data/classification-proposals.yaml`，不得进入正式事件流。
- 网页使用的当前关系由事件流计算，不手工维护节点论文列表。

## 派生数据

- 作者图、taxonomy 图、当前分类关系、搜索索引和网页 JSON 都是可重建结果。
- 派生文件不得作为事实来源，也不得反向覆盖 `data/`。
- 网页技术栈和部署方式确定前，不预设具体框架。

## 修改要求

- 修改数据前先运行现有校验；修改后再次校验。
- 保留数据来源、更新时间和变更理由。
- 不在 Git 数据中写入本机绝对路径、密钥或临时缓存。
- 项目如需 Python 依赖，应创建独立 Conda 环境；不得安装到 `base`。
- 经用户批准并完成校验的改动应及时创建独立 Git commit 并推送到远程仓库，不得无故长期滞留在工作区；提交时不得混入尚未批准或属于其他工作阶段的改动。
