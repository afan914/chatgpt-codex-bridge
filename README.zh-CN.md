# ChatGPT Context Bridge for Codex

ChatGPT Context Bridge for Codex 是一个本地优先的工具，用来把 ChatGPT 对话上下文写入 Codex 项目目录。

它解决的问题很直接：你可能在 ChatGPT 里讨论产品想法、需求、技术方案和实现细节，然后切换到 Codex App 开始开发。但 Codex App 默认不知道前面 ChatGPT 对话里发生了什么。这个项目的 MVP 目标，就是用一个浏览器扩展和一个本地 Bridge CLI，把这段上下文自动交给 Codex。

## 架构概览

项目分为三层职责：

- 浏览器扩展：读取当前 ChatGPT 对话页，把上下文发送给本地 Bridge。该部分从 Milestone 2 开始实现。
- 本地 Bridge CLI：运行在 `127.0.0.1:17321`，校验 payload，并把上下文文件写入配置好的 Codex 项目目录。
- Shared package：维护共享 TypeScript 类型、payload 校验、slug 生成、文件名清洗、URL 工具和弹窗 i18n 工具。

Bridge 不直接解析浏览器 DOM，不调用 ChatGPT 私有 API，也不会把对话内容上传到远程服务。

## 快速开始

安装依赖：

```bash
pnpm install
```

初始化 Bridge 配置：

```bash
pnpm dev:bridge -- init
```

配置你的 Codex 项目目录：

```bash
pnpm dev:bridge -- config set-project /path/to/your/codex/project
```

启动 Bridge：

```bash
pnpm dev:bridge
```

测试健康检查：

```bash
curl http://127.0.0.1:17321/health
```

使用 mock payload 测试导入：

```bash
curl -X POST http://127.0.0.1:17321/import-chatgpt-context \
  -H "Content-Type: application/json" \
  -d @examples/mock-payload.json
```

生成的文件会出现在：

```text
<project-root>/.codex-context/chatgpt/atlas-plugin-discussion-abc123/
```

如果你不熟悉终端、Node.js 或浏览器扩展，请先阅读非技术用户快速开始：
[非技术用户快速开始](docs/quickstart.zh-CN.md)

## 运行 Bridge

Bridge CLI 命令名是：

```bash
chatgpt-codex-bridge
```

本地开发时使用：

```bash
pnpm dev:bridge
```

支持的命令：

```bash
pnpm dev:bridge -- init
pnpm dev:bridge -- start
pnpm dev:bridge -- status
pnpm dev:bridge -- config set-project /path/to/project
```

## 加载浏览器扩展

浏览器扩展会在 Milestone 2 实现。Milestone 1 只包含 extension workspace 占位。

Milestone 2 完成后，预期构建方式是：

```bash
pnpm build:extension
```

然后在 `chrome://extensions` 里通过“加载已解压的扩展程序”选择 `apps/extension/dist`。

## 当前限制

- Milestone 1 只实现 Bridge core 和 shared package。
- 扩展弹窗会在 Milestone 2 实现。
- 真实 ChatGPT DOM 提取会在 Milestone 3 实现。
- 图片和文件提取在 MVP 中先记录为 unresolved asset references。
- 重复导入同一对话时，会覆盖确定性的 conversation folder。

## 安全说明

- Bridge 只绑定到 `127.0.0.1`。
- Bridge 只会写入配置好的项目目录。
- 路径穿越会被拒绝。
- 本工具不会上传对话内容。
- 项目刻意不使用 ChatGPT 私有 API。

更多细节见：[安全说明](docs/security.zh-CN.md)。
