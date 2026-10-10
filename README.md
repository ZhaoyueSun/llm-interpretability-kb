# LLM Interpretability Knowledge Base

本项目维护一个以 100 篇 core papers 和 10 篇 classic papers 为基础、允许按 taxonomy 研究需要增补论文的 LLM interpretability 语料库，并据此构建可持续更新的网页知识图谱。

当前处于数据结构搭建阶段。论文名单、筛选过程和入选理由由 PaperManage 提供；本项目负责规范化论文数据、整理英文 abstract、完成中文翻译、维护 taxonomy 与论文分类关系，以及生成网页所需的数据。

## 数据边界

- Git 保存论文属性、双语 abstract、双语 AI Summary、作者消歧、taxonomy、分类变更记录和网页代码。
- PDF 和 Docling 全文保存在 PaperKnowledgeBase，本项目只读访问，不复制到本仓库。
- PaperManage 的交付格式暂不预设；交付文件放在 Git 忽略的 `imports/` 中，收到实际结果后再编写适配逻辑。
- 英文 abstract 与中文翻译在最终论文名单确定后由本项目处理，不调用第三方 API。

## 当前目录

```text
data/       正式数据源
docs/       已确认的数据与维护规则
schemas/    数据格式约束
scripts/    导入、校验与构建脚本
web/        网页源代码，技术栈尚未确定
tests/      数据和构建逻辑测试
```

详细规则见 [项目章程](PROJECT_CHARTER.md)、[数据模型](docs/data-model.md)和 [Agent 规则](AGENTS.md)。
