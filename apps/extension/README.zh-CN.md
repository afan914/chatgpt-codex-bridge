# 浏览器扩展

## 当前 Milestone

Milestone 2 实现 Manifest V3 弹窗、Bridge 健康检查、mock Send to Codex 流程、基于 URL 的 ChatGPT 页面检测，以及英文 / 中文切换。

弹窗验证这条本地链路：

```text
扩展弹窗 -> 本地 Bridge -> 配置好的 Codex 项目 .codex-context/
```

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

## i18n

弹窗从 `@chatgpt-codex-bridge/shared` 导入 `t(locale, key)` 和 `Locale`。

用户选择的语言保存在 `chrome.storage.local`：

```text
chatgptCodexBridge.locale
```

## 当前限制

本 milestone 只发送 mock payload。真实 ChatGPT DOM 提取尚未实现，会在 Milestone 3 中实现。
