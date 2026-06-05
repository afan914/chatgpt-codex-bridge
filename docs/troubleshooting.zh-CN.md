# 故障排查

## Bridge 未连接

如果扩展 popup 显示 Bridge 未连接，常见原因是：

1. Bridge 没有运行。
2. 运行 Bridge 的终端窗口被关闭。
3. 端口 `17321` 被阻塞或占用。

启动 Bridge：

```bash
pnpm dev:bridge
```

然后测试：

```bash
curl http://127.0.0.1:17321/health
```

然后重新打开 popup。

## 端口 `17321` 已被占用

停止已有的 Bridge 进程，或编辑：

```text
~/.chatgpt-codex-bridge/config.json
```

Milestone 1 不会自动选择其他端口，因为扩展默认期望访问 `17321`。

## 项目路径未配置

运行：

```bash
pnpm dev:bridge -- config set-project /path/to/your/codex/project
```

## 当前页面不是 ChatGPT

Milestone 2 只允许在 ChatGPT 页面上使用 Send to Codex。请打开：

```text
https://chatgpt.com
```

然后重新打开 popup。

## Send to Codex 按钮不可点击

可能原因：

1. Bridge 未连接。
2. Bridge 状态仍在检查。
3. 当前页面不是 ChatGPT。
4. 发送请求正在进行中。

请查看 popup 中的状态提示。

## 语言没有保留

可能原因：

1. 浏览器阻止了扩展 storage。
2. 扩展被重新加载。
3. storage 写入失败。

请重新加载扩展并再次切换语言。

## 未检测到消息

真实 DOM 提取会在 Milestone 3 实现。如果后续出现这个提示，请刷新 ChatGPT 页面，并确认对话消息在页面上可见。

## CORS 错误

Milestone 1 中 Bridge 会返回以下 CORS header：

```text
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

如果浏览器仍然报告 CORS 问题，请确认 Bridge 正在运行，并且请求目标是：

```text
http://127.0.0.1:17321
```

## 扩展无法加载

先构建：

```bash
pnpm build:extension
```

然后在 `chrome://extensions` 中加载 `apps/extension/dist`。

请确认选择的是 `apps/extension/dist`，不是 `apps/extension`。

## 扩展构建产物缺少 `manifest.json`

运行：

```bash
pnpm build:extension
```

然后检查：

```text
apps/extension/dist/manifest.json
```

如果缺失，请检查 `apps/extension/vite.config.ts` 中的 Vite manifest copy plugin。
