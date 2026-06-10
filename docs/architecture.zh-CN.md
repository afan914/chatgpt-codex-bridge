# 架构

## 扩展职责

浏览器扩展负责浏览器侧工作：

- 提供 popup UI。
- 检查本地 Bridge 健康状态。
- 读取当前标签页 URL 和标题。
- 通过 URL 检测 ChatGPT 页面。
- 支持英文 / 简体中文运行时切换。
- 导出上下文包时，把提取出的 payload 发给 background service worker，由浏览器侧生成 zip 并下载。
- 导入 Codex 项目时，把提取出的对话 payload 发送给本地 Bridge。

扩展不负责把文件写入 Codex 项目目录；写入项目目录仍由 Bridge 完成。

## Bridge 职责

Bridge 是一个本地 Node.js CLI 和 HTTP server。它负责：

- 从 `~/.chatgpt-codex-bridge/config.json` 读取配置。
- 自动发现常见位置下的本地项目，并合并手动配置的项目。
- 监听 `127.0.0.1:17321`。
- 处理 `/health`。
- 处理 `/import-chatgpt-context`。
- 校验传入 payload。
- 生成确定性的 conversation slug。
- 把上下文导出到 `.codex-context/chatgpt/` 下的确定性目录。
- 执行路径安全检查。
- 返回结构化成功 / 错误响应。

Bridge 只在“导入到 Codex 项目”时需要。普通“导出为上下文包”不需要 Bridge。

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
- Markdown / manifest 等纯上下文包生成逻辑。

## 数据流

```text
ChatGPT 对话 DOM
-> Content script
-> 提取 conversation payload
-> 扩展弹窗
```

导出上下文包：

```text
扩展弹窗
-> Background service worker
-> 浏览器侧 JSZip package builder
-> chrome.downloads.download
-> 浏览器下载 zip
```

导入 Codex 项目：

```text
扩展弹窗
-> Bridge client
-> 本地 Bridge HTTP API
-> Context writer
-> Codex 项目 .codex-context/
```

## Content Script 职责

- 监听提取请求。
- 读取当前页面 DOM。
- 提取消息顺序。
- 识别消息角色。
- 提取可读文本。
- 提取代码块。
- 提取链接。
- 在简单场景下检测 unresolved asset references。
- 向 popup 返回类型化 payload。

Bridge 不知道 ChatGPT DOM 结构。DOM 提取只存在于扩展 content script。

## Popup 职责

- 展示页面、Bridge 和提取状态。
- 通过 `chrome.tabs.sendMessage` 请求提取。
- 安全处理消息通信失败。
- 展示提取摘要。
- 导出包时把 payload 发送给 background service worker。
- 导入 Codex 时把 payload 发送给 Bridge。
- 展示成功和错误状态。
- 支持运行时 i18n。

## 为什么需要本地 Bridge

浏览器扩展适合读取当前页面，也可以在浏览器侧生成 zip 下载。但本地项目文件写入应由用户明确启动和配置的本地进程来完成。Bridge 为扩展提供一个很小的本地 API，用来完成 Codex 项目写入步骤。

## 为什么导出包不需要 Bridge

导出上下文包只需要生成 zip 并交给浏览器下载，不需要写入任意本地项目目录。因此它由扩展 background service worker 使用本地打包的 JSZip 完成，不加载 CDN，不上传对话内容。

## 为什么只监听 `127.0.0.1`

Bridge 可以把私有对话内容写入本地项目目录。绑定到 `127.0.0.1` 可以确保 API 只在用户自己的电脑上可访问，避免把写入能力暴露到局域网或公网。

## 为什么不使用 `chrome.i18n`

扩展使用自定义翻译表，而不是 `chrome.i18n`，因为项目需要在 popup 内手动运行时切换语言。`chrome.i18n` 跟随浏览器语言，不适合这个简单的手动切换需求。

## Content Script 构建

content script 会构建为独立的 IIFE bundle，以便作为 Chrome content script 稳定运行。最终扩展构建会输出：

```text
apps/extension/dist/content.js
```

popup 通过 `chrome.tabs.sendMessage` 与 content script 通信。popup 必须处理连接失败，因为扩展重新加载后，已经打开的 ChatGPT 页面可能还没有重新注入 content script，需要刷新页面。
