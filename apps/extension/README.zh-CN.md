# 浏览器扩展

## 当前 Milestone

Milestone 3 实现从当前页面提取真实 ChatGPT 对话。

弹窗验证这条本地链路：

```text
ChatGPT DOM -> content script -> 扩展弹窗 -> 本地 Bridge -> 配置好的 Codex 项目 .codex-context/
```

## 当前扩展能力

- 检测 ChatGPT 页面。
- 请求 content script 提取。
- 提取消息、角色、文本、代码块和链接。
- 把真实 payload 发送给本地 Bridge。
- 支持英文 / 中文 UI。

## 构建

```bash
pnpm --filter extension build
```

构建输出目录：

```text
apps/extension/dist/
```

## 加载未打包扩展

打开 `chrome://extensions`，启用 Developer mode，点击 Load unpacked，选择：

```text
apps/extension/dist
```

该目录必须包含 `manifest.json`、`popup.html` 和 `serviceWorker.js`。
它还必须包含会注入 ChatGPT 页面的 `content.js`。

## Content Script 构建

content script 单独通过下面命令构建：

```bash
pnpm --filter extension build:content
```

普通构建命令会自动执行它：

```bash
pnpm --filter extension build
```

`content.js` 会输出为独立 IIFE bundle，这样 Chrome 可以把它作为 content script 执行，而不需要运行时 import。

## 权限

- `activeTab`：用户操作后允许与当前标签页交互。
- `tabs`：读取当前标签页 URL 和标题，用于检测 ChatGPT 页面。
- `storage`：保存用户选择的语言。
- host permissions 仅限 ChatGPT 域名和 `http://127.0.0.1:17321/*`。

扩展不请求 `<all_urls>`。

## Bridge 通信

弹窗调用：

```text
GET http://127.0.0.1:17321/health
POST http://127.0.0.1:17321/import-chatgpt-context
```

如果 Bridge 未连接，弹窗会显示翻译后的提示，并禁用 Send to Codex。

popup 还会通过 `chrome.tabs.sendMessage` ping ChatGPT content script。如果 content script 不可用，popup 会显示翻译后的刷新页面提示，并禁用 Send to Codex。

## 验证 Content Script

1. 确认 `dist/content.js` 存在。
2. 确认 `dist/manifest.json` 引用了 `content.js`。
3. 打开 ChatGPT DevTools，查找：

```text
ChatGPT Context Bridge content script loaded
```

## i18n

弹窗从 `@chatgpt-codex-bridge/shared` 导入 `t(locale, key)` 和 `Locale`。

用户选择的语言保存在 `chrome.storage.local`：

```text
chatgptCodexBridge.locale
```

## 当前限制

- 暂不完整下载 assets。
- 如果 ChatGPT 页面结构变化，DOM 提取可能需要更新。
- 重新加载扩展后，请刷新 ChatGPT 页面。
