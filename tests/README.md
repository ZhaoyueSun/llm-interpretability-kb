# Tests

后续测试至少覆盖：

- YAML 和 JSONL 是否符合 schema；
- corpus 是否包含 100 篇 core papers 和 10 篇 classic papers；
- `paper_id`、作者引用和 taxonomy 节点引用是否有效；
- classification event 能否正确生成当前关系；
- 未批准提案是否不会进入正式数据；
- 最终论文是否都有英文 abstract 和中文翻译；
- 每篇论文是否都有符合四段式约定的英文、中文 AI Summary；
- 作者图剪枝与边权计算是否正确；
- Git 中是否误加入 PDF、Docling 全文或本机绝对路径。
