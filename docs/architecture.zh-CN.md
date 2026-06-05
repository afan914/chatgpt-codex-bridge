# 架构

## 扩展职责

浏览器扩展负责浏览器侧工作：

- 检测当前活动页面是否是 ChatGPT 对话页。
- 从当前页面 DOM 中提取可见对话内容。
- 提供 popup UI，并支持英文 / 简体中文运行时切换。
- 把符合约定结构的 payload 发送给本地 Bridge。

扩展不负责把文件写入 Codex 项目目录。

## Bridge 职责

Bridge 是一个本地 Node.js CLI 和 HTTP server。它负责：

- 从 `~/.chatgpt-codex-bridge/config.json` 读取配置。
- 监听 `127.0.0.1:17321`。
- 处理 `/health`。
- 处理 `/import-chatgpt-context`。
- 校验传入 payload。
- 把上下文导出到 `.codex-context/chatgpt/` 下的确定性目录。

Bridge 不关心 ChatGPT DOM selector，也不调用 ChatGPT API。

## Shared Package 职责

shared package 维护 extension 和 bridge 共同使用的代码：

- Payload 和 response 类型。
- Asset 和 config 类型。
- Payload 校验。
- Conversation slug 工具。
- 文件名清洗工具。
- URL 工具。
- 轻量 i18n 翻译表和 `t(locale, key)`。

## 数据流

```text
ChatGPT 对话页面
-> 浏览器扩展提取当前对话
-> 扩展 POST 到 http://127.0.0.1:17321/import-chatgpt-context
-> Bridge 校验 payload 和配置
-> Bridge 写入 <project-root>/.codex-context/chatgpt/<conversation-slug>/
-> Codex App 读取 CODEX_TASK.md 和 full_conversation.md
```

## 为什么需要本地 Bridge

浏览器扩展适合读取当前页面，但本地项目文件写入应由用户明确启动和配置的本地进程来完成。Bridge 为扩展提供一个很小的本地 API，用来完成文件写入步骤。

## 为什么只监听 `127.0.0.1`

Bridge 可以把私有对话内容写入本地项目目录。绑定到 `127.0.0.1` 可以确保 API 只在用户自己的电脑上可访问，避免把写入能力暴露到局域网或公网。
