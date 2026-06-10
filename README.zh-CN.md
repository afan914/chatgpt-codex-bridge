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
Milestone 5：生产 CLI、持久本地服务和浏览器侧上下文包导出已实现。

## 当前可用能力

1. 扩展可以在浏览器侧直接导出 zip 上下文包，不要求本地 Bridge 正在运行。
2. 直接导入到 Codex 项目时，Bridge 在本地 `127.0.0.1:17321` 运行。
3. Bridge 可以管理多个 Codex 项目路径。
4. popup 支持英文 / 中文切换。
5. 扩展读取当前打开的 ChatGPT 对话。
6. 扩展提取消息、代码块、链接和资源引用。
7. 扩展 / Bridge 会保存支持的资源，包括 snippets、HTML / Markdown 产物和支持的小型 data URL 图片。
8. 未解析或保存失败的资源会记录在 `assets_manifest.json`。
9. Bridge 运行后，你可以直接导入到自动发现或手动配置的 Codex 项目。
10. 即使 Bridge 没有运行，你也可以导出 zip 上下文包，给其他工具或手动使用。

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

构建扩展：

```bash
pnpm build:extension
```

在 `chrome://extensions` 里加载 `apps/extension/dist`。

然后：

1. 打开你想导出的 ChatGPT 对话。
2. 点击扩展图标。
3. 确认已检测到 ChatGPT 对话。
4. 确认对话和资源摘要已显示。
5. 选择“导出为上下文包”。
6. 点击“导出包”。
7. 浏览器会下载 `chatgpt-context-package-<conversation-slug>.zip`。

如果你只需要 zip 上下文包，不需要手动启动 Bridge，也不需要手动添加 Codex 项目。

如果你想直接导入到 Codex 项目，再进行一次性本地服务设置：

```bash
pnpm build
pnpm --filter ./apps/bridge link --global
chatgpt-codex-bridge install-service
```

Bridge 会自动发现常见位置下的本地项目。如果扩展里没有出现你的项目，再手动添加：

```bash
chatgpt-codex-bridge project add <id> <path>
```

`install-service` 会安装用户级自动启动服务；日常使用不需要手动运行 `pnpm dev:bridge`。

## Bridge 命令

Bridge 只在“导入到 Codex 项目”时需要。普通“导出为上下文包”走浏览器侧生成和下载，不依赖 Bridge。

```bash
chatgpt-codex-bridge start
chatgpt-codex-bridge status
chatgpt-codex-bridge stop
chatgpt-codex-bridge install-service
chatgpt-codex-bridge uninstall-service
```

手动项目注册命令：

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
- Bridge 只写入用户选择的自动发现或手动配置项目目录。
- 浏览器侧导出只会生成 zip 下载，不会写入任意本地项目目录。
- 路径穿越会被拒绝。
- 本工具不会上传对话内容。
- 项目刻意不使用 ChatGPT 私有 API。
