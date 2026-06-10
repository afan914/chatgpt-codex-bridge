# 安全

## 本地 Bridge 模型

Bridge 只监听 `127.0.0.1`。它绝不能监听 `0.0.0.0`，因为 Bridge 具备向配置项目目录写文件的能力。

## 本地提取

对话内容由 content script 从当前 ChatGPT 页面读取。导出上下文包时，内容会在扩展 background service worker 内本地生成 zip 并由浏览器下载。导入 Codex 项目时，内容才会发送到 `127.0.0.1` 上的本地 Bridge，Bridge 再写入用户选择的自动发现或手动配置项目目录。本工具不会把对话内容上传到远程服务器。

## 不上传到远程

Bridge 只在本地写入文件；浏览器侧导出只在本地生成下载包。两种路径都不会把 ChatGPT 内容上传到远程服务。

## 浏览器扩展权限

扩展使用范围很窄的 Manifest V3 权限：

- `activeTab` 和 `tabs` 用于读取当前标签页标题和 URL，从而检测 ChatGPT 页面。
- `storage` 用于保存用户选择的语言。
- `downloads` 仅用于保存生成的上下文 zip 包。
- host permissions 仅限 ChatGPT 域名和本地 Bridge 地址。

扩展不请求 `<all_urls>`。

## 路径穿越防护

writer 会使用清洗后的 conversation slug 构造输出路径，并验证最终路径仍然位于用户选择的项目目录内部。

## 项目目录限制

只有直接导入 Codex 项目时，才需要选择项目目录。Bridge 会自动发现常见位置下的本地项目；如果没有发现目标项目，可以手动配置：

```bash
chatgpt-codex-bridge project add <id> /path/to/project
```

如果没有可用项目，或选择的项目路径不存在，导入请求会被拒绝。

导出上下文包不需要配置项目目录，也不会写入任意本地项目目录。

## 浏览器侧导出安全

浏览器侧导出使用随扩展打包的 `jszip` npm 依赖，不从 CDN 加载脚本。大型 data URL 图片可能会被跳过并记录在 `assets_manifest.json` 中，以降低内存和文件体积风险。

## 敏感数据注意事项

ChatGPT 对话可能包含私密产品方案、代码、凭证或个人信息。请把生成的 `.codex-context/` 目录视为敏感项目文件。

除非你已经审查过内容，否则不要把生成的上下文导出提交到代码仓库。

## ChatGPT 私有 API

项目刻意不使用 ChatGPT 私有 API。扩展读取的是可见页面 DOM，不调用 ChatGPT 私有后端 API，不绕过认证，也不会抓取账号历史。

## i18n 存储

扩展只会在 `chrome.storage.local` 中保存用户选择的语言，例如 `"en"` 或 `"zh"`。它不会把对话内容存入浏览器 storage。

## 数据敏感性

导出的上下文可能包含私密对话内容。用户在提交到公开仓库前应先审查生成文件。
