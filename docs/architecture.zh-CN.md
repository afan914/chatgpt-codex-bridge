# 架构

## 扩展职责

浏览器扩展负责浏览器侧工作：

- 提供 popup UI。
- 检查本地 Bridge 健康状态。
- 读取当前标签页 URL 和标题。
- 通过 URL 检测 ChatGPT 页面。
- 支持英文 / 简体中文运行时切换。
- 在 Milestone 2 中向本地 Bridge 发送 mock payload。

扩展不负责把文件写入 Codex 项目目录。

Milestone 2 中，扩展还不会读取真实 ChatGPT DOM。弹窗只通过发送 mock payload 来验证“浏览器扩展 -> Bridge -> 项目目录”的集成链路。

## Bridge 职责

Bridge 是一个本地 Node.js CLI 和 HTTP server。它负责：

- 从 `~/.chatgpt-codex-bridge/config.json` 读取配置。
- 监听 `127.0.0.1:17321`。
- 处理 `/health`。
- 处理 `/import-chatgpt-context`。
- 校验传入 payload。
- 生成确定性的 conversation slug。
- 把上下文导出到 `.codex-context/chatgpt/` 下的确定性目录。
- 执行路径安全检查。
- 返回结构化成功 / 错误响应。

Bridge 不关心 ChatGPT DOM selector，也不调用 ChatGPT API。

## Shared Package 职责

shared package 维护 extension 和 bridge 共同使用的代码：

- Payload 和 response 类型。
- Asset 和 config 类型。
- Payload 校验。
- Conversation slug 工具。
- 文件名清洗工具。
- URL 工具。
- i18n 类型。
- 翻译表。
- 轻量 i18n 翻译表和 `t(locale, key)`。

## 数据流

```text
ChatGPT 页面
-> 扩展弹窗
-> Mock payload builder
-> Bridge client
-> 本地 Bridge HTTP API
-> Context writer
-> Codex 项目 .codex-context/
```

## 为什么需要本地 Bridge

浏览器扩展适合读取当前页面，但本地项目文件写入应由用户明确启动和配置的本地进程来完成。Bridge 为扩展提供一个很小的本地 API，用来完成文件写入步骤。

## 为什么只监听 `127.0.0.1`

Bridge 可以把私有对话内容写入本地项目目录。绑定到 `127.0.0.1` 可以确保 API 只在用户自己的电脑上可访问，避免把写入能力暴露到局域网或公网。

## 为什么不使用 `chrome.i18n`

扩展使用自定义翻译表，而不是 `chrome.i18n`，因为项目需要在 popup 内手动运行时切换语言。`chrome.i18n` 跟随浏览器语言，不适合这个简单的手动切换需求。
