# 安全

## 本地 Bridge 模型

Bridge 只监听 `127.0.0.1`。它绝不能监听 `0.0.0.0`，因为 Bridge 具备向配置项目目录写文件的能力。

## 本地提取

对话内容由 content script 从当前 ChatGPT 页面读取。它只会发送到 `127.0.0.1` 上的本地 Bridge，Bridge 再写入配置好的本地项目目录。本工具不会把对话内容上传到远程服务器。

## 不上传到远程

Bridge 只在本地写入文件，不会把 ChatGPT 内容上传到远程服务。

## 浏览器扩展权限

扩展使用范围很窄的 Manifest V3 权限：

- `activeTab` 和 `tabs` 用于读取当前标签页标题和 URL，从而检测 ChatGPT 页面。
- `storage` 用于保存用户选择的语言。
- host permissions 仅限 ChatGPT 域名和本地 Bridge 地址。

扩展不请求 `<all_urls>`。

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

项目刻意不使用 ChatGPT 私有 API。扩展读取的是可见页面 DOM，不调用 ChatGPT 私有后端 API，不绕过认证，也不会抓取账号历史。

## i18n 存储

扩展只会在 `chrome.storage.local` 中保存用户选择的语言，例如 `"en"` 或 `"zh"`。它不会把对话内容存入浏览器 storage。

## 数据敏感性

导出的上下文可能包含私密对话内容。用户在提交到公开仓库前应先审查生成文件。
