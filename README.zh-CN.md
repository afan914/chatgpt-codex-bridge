# ChatGPT Context Bridge for Codex

[English](README.md) | [中文](README.zh-CN.md)

ChatGPT Context Bridge for Codex 是一个本地优先工具，用来把浏览器当前打开的 ChatGPT 对话上下文导入 Codex 项目，或导出为可携带的 zip 上下文包。

它解决的问题很直接：你在 ChatGPT 里讨论需求、方案和实现细节，然后切到 Codex App 开发时，Codex 默认不知道前面的讨论。这个工具把当前对话整理成本地文件，让 Codex 能接着读。

本工具只在本机工作：扩展读取当前 ChatGPT 标签页，本地 Bridge 运行在 `127.0.0.1`，文件写入你的电脑。不会调用 ChatGPT 私有 API，也不会上传对话内容。

## 当前状态

Milestone 1：Bridge core 已实现。
Milestone 2：带 mock payload 和 i18n 的扩展弹窗已实现。
Milestone 3：真实 ChatGPT 对话提取已实现。
Milestone 4：资源提取、Codex 项目选择、上下文包导出和完整本地可用流程已实现。

## 当前可用能力

1. Bridge 在本地 `127.0.0.1:17321` 运行。
2. Bridge 可以管理多个 Codex 项目路径。
3. 扩展 popup 可以连接本地 Bridge。
4. popup 支持英文 / 中文切换。
5. 扩展读取当前打开的 ChatGPT 对话。
6. 扩展提取消息、代码块、链接和资源引用。
7. 扩展 / Bridge 会保存支持的资源，包括 snippets、HTML / Markdown 产物和支持的 data URL 图片。
8. 未解析或保存失败的资源会记录在 `assets_manifest.json`。
9. 你可以直接导入到选中的 Codex 项目。
10. 你也可以导出 zip 上下文包，给其他工具或手动使用。

## 快速开始

克隆仓库：

```bash
git clone https://github.com/afan914/chatgpt-codex-bridge.git
cd chatgpt-codex-bridge
```

安装依赖：

```bash
pnpm install
```

启动本地 Bridge：

```bash
pnpm dev:bridge
```

另开一个终端，添加 Codex 项目：

```bash
chatgpt-codex-bridge project add <id> <path>
```

构建扩展：

```bash
pnpm build:extension
```

在 `chrome://extensions` 里加载 `apps/extension/dist`。

然后：

1. 打开你想导出的 ChatGPT 对话。
2. 点击扩展图标。
3. 确认本地服务已连接。
4. 确认已检测到 ChatGPT 对话。
5. 确认对话和资源摘要已显示。
6. 选择“导入到 Codex 项目”或“导出为上下文包”。
7. 点击主按钮。
8. 打开生成的 `.codex-context/chatgpt/` 目录或 zip 包。

## Bridge 命令

```bash
chatgpt-codex-bridge project list
chatgpt-codex-bridge project add <id> <path>
chatgpt-codex-bridge project remove <id>
chatgpt-codex-bridge project set-default <id>
```

旧快捷命令仍然可用：

```bash
chatgpt-codex-bridge config set-project /path/to/project
```

## 当前限制

部分 ChatGPT 资源可能无法自动保存，尤其是 blob URL、受保护 URL，或需要 ChatGPT 私有后端访问的 artifact。工具不会静默丢弃它们，而是记录到 `assets_manifest.json`。

重复导入同一对话时，会覆盖该项目下确定性的对话目录。

## 安全说明

- Bridge 只绑定到 `127.0.0.1`。
- Bridge 只写入显式配置的项目目录或本地导出目录。
- 路径穿越会被拒绝。
- 本工具不会上传对话内容。
- 项目刻意不使用 ChatGPT 私有 API。
