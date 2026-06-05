# 故障排查

## Bridge 未连接

启动 Bridge：

```bash
pnpm dev:bridge
```

然后测试：

```bash
curl http://127.0.0.1:17321/health
```

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

这是 Milestone 2 和 Milestone 3 中 extension flow 的提示。请打开以下地址下的对话：

```text
https://chatgpt.com/c/<id>
https://chat.openai.com/c/<id>
```

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

扩展会在 Milestone 2 实现。完成后先构建：

```bash
pnpm build:extension
```

然后在 `chrome://extensions` 中加载 `apps/extension/dist`。
