# 安全

## 本地 Bridge 模型

Bridge 只监听 `127.0.0.1`。它绝不能监听 `0.0.0.0`，因为 Bridge 具备向配置项目目录写文件的能力。

## 不上传到远程

Bridge 只在本地写入文件，不会把 ChatGPT 内容上传到远程服务。

## 路径穿越防护

writer 会使用清洗后的 conversation slug 构造输出路径，并验证最终路径仍然位于配置好的项目目录内部。

## 项目目录限制

用户必须显式配置项目目录：

```bash
pnpm dev:bridge -- config set-project /path/to/project
```

如果没有配置项目路径，或配置路径不存在，导入请求会被拒绝。

## 敏感数据注意事项

ChatGPT 对话可能包含私密产品方案、代码、凭证或个人信息。请把生成的 `.codex-context/` 目录视为敏感项目文件。

除非你已经审查过内容，否则不要把生成的上下文导出提交到代码仓库。

## ChatGPT 私有 API

项目刻意不使用 ChatGPT 私有 API。Milestone 3 会通过当前页面 DOM 提取对话内容。
