# Scripts

本目录保存确定性脚本，包括 PaperManage 交付适配、数据校验、当前分类关系计算、作者图构建和网页数据构建。

## `build_corpus.rb`

根据 PaperManage 的实际 JSON 交付生成 `data/corpus.yaml`。脚本只复制正式成员关系、组内展示顺序、候选池排名、入选理由、稳定 handoff ID 和原始条目序号，不复制标题、作者、taxonomy、import 路径、绝对路径或全文状态。

脚本使用 Ruby 标准库，不需要安装项目依赖。默认输入和输出分别是：

```text
imports/2026-10-08__llm-interpretability-final-corpus.json
data/corpus.yaml
```

也可以通过两个位置参数指定输入和输出路径。

## `audit_abstracts.rb`

检查 PaperKnowledgeBase metadata 中的英文 abstract 是否可以在对应 Docling 全文中得到支持。报告规范化精确匹配数和 token 覆盖率低于 95% 的待审论文，不修改任何数据。

## `build_papers.rb`

根据 PaperManage manifest 与只读 metadata 创建缺失的 `data/papers/<paper_id>.yaml`，并建立初始 `data/authors.yaml`。脚本不会覆盖已经存在的论文文件，以免破坏中文翻译或人工补充信息。

初始作者 ID 根据交付中的作者姓名确定，`disambiguation_status` 为 `unreviewed`；作者别名合并和机构补充需后续单独审核。
