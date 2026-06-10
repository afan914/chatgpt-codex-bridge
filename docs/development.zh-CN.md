# 开发

## 本地环境

安装 Node.js 20 或更高版本，然后安装依赖：

```bash
pnpm install
```

## Workspace 命令

```bash
pnpm dev:bridge
pnpm build:bridge
pnpm build:extension
pnpm typecheck
pnpm lint
```

Extension 的 build、popup、真实提取、资源提取、项目选择和上下文包导出已经可用于本地完整流程。

`pnpm dev:bridge` 只用于开发 Bridge。普通用户导出上下文包不需要启动 Bridge；导出包由扩展 background service worker 在浏览器侧生成并下载。

## 以开发模式运行 Bridge

初始化配置：

```bash
pnpm dev:bridge -- init
```

配置项目目录：

```bash
chatgpt-codex-bridge project add my-project /path/to/your/codex/project
```

启动 Bridge：

```bash
pnpm dev:bridge
```

## 构建扩展

```bash
pnpm build:extension
```

构建产物会生成到 `apps/extension/dist`。

## 加载未打包扩展

1. 打开 `chrome://extensions`。
2. 打开 Developer mode。
3. 点击 “Load unpacked”。
4. 选择 `apps/extension/dist`。

## 从 Popup 测试 Bridge 健康状态

1. 启动 Bridge：

```bash
pnpm dev:bridge
```

2. 打开扩展 popup。
3. 确认 Bridge 已连接。

## 测试未连接状态

1. 停止 Bridge。
2. 重新打开 popup。
3. 确认显示 Bridge 未连接。
4. 确认“导出为上下文包”仍可用。
5. 确认“导入到 Codex 项目”不可用。

## 测试浏览器侧上下文包导出

1. 停止 Bridge。
2. 打开真实 ChatGPT 对话。
3. 打开 popup。
4. 选择“导出为上下文包”。
5. 点击“导出包”。
6. 确认浏览器下载 `chatgpt-context-package-<slug>.zip`。

导出包应由 background service worker 处理，popup 不应直接生成 zip。

## 使用真实提取测试导入到 Codex

1. 启动 Bridge。
2. 打开真实 ChatGPT 对话。
3. 打开 popup。
4. 确认提取状态成功。
5. 确认消息数大于 0。
6. 点击“导入到 Codex”。
7. 确认文件出现在：

```text
<project-root>/.codex-context/chatgpt/
```

默认发送当前页面读取到的真实 ChatGPT 对话。旧 payload 不带 `destination` 时仍会导入默认 Codex 项目。

## 测试 i18n

1. 打开 popup。
2. 切换 EN / 中文。
3. 关闭 popup。
4. 重新打开 popup。
5. 确认语言选择被保留。

## 检查 Vite 构建产物

执行 `pnpm build:extension` 后确认：

```text
apps/extension/dist/manifest.json
apps/extension/dist/popup.html
apps/extension/dist/serviceWorker.js
apps/extension/dist/content.js
```

## 验证 Content Script 构建

运行：

```bash
pnpm build:extension
```

检查：

```text
apps/extension/dist/content.js
apps/extension/dist/manifest.json
```

manifest 必须引用：

```json
"js": ["content.js"]
```

打开 ChatGPT 页面，打开 DevTools，确认出现日志：

```text
ChatGPT Context Bridge content script loaded
```

content script 通过 `vite.content.config.ts` 构建为 IIFE bundle，不依赖运行时 import 解析。

## Mock Payload 测试

Bridge 运行后执行：

```bash
curl -X POST http://127.0.0.1:17321/import-chatgpt-context \
  -H "Content-Type: application/json" \
  -d @examples/mock-payload.json
```

预期输出包含：

```json
{
  "ok": true,
  "conversationSlug": "atlas-plugin-discussion-abc123"
}
```

预期文件：

```text
<project-root>/.codex-context/chatgpt/atlas-plugin-discussion-abc123/
  CODEX_TASK.md
  README.md
  full_conversation.md
  manifest.json
  assets_manifest.json
  assets/snippets/
```

## 手动检查纯函数

Milestone 1 暂不包含完整测试套件。以下函数是纯函数，已经适合后续添加单元测试：

- `createConversationSlug("Atlas plugin discussion", "https://chatgpt.com/c/abc123")` 应返回 `atlas-plugin-discussion-abc123`。
- `sanitizeFilename("bad/name?.md")` 应移除不安全路径字符。
- `validateImportPayload()` 遇到空 `messages` 应返回 `EMPTY_MESSAGES`。
- `buildFullConversationMarkdown()` 应保留消息顺序、链接和代码块。
- `buildCodexTaskMarkdown()` 应包含来源标题、URL 和导出时间。
