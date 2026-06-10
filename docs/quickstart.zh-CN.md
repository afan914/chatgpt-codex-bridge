# 非技术用户快速开始

## 第 1 步：下载本项目

打开：

```text
https://github.com/afan914/chatgpt-codex-bridge
```

点击 `Code`，选择 `Download ZIP`，解压后在 `chatgpt-codex-bridge` 文件夹里打开终端。

如果你已经会用 Git：

```bash
git clone https://github.com/afan914/chatgpt-codex-bridge.git
cd chatgpt-codex-bridge
```

## 第 2 步：安装依赖

```bash
pnpm install
```

## 第 3 步：构建扩展

在项目目录里运行：

```bash
pnpm build:extension
```

## 第 4 步：加载扩展

1. 打开 `chrome://extensions`。
2. 打开 Developer mode。
3. 点击 Load unpacked。
4. 选择 `apps/extension/dist`。

## 第 5 步：打开 ChatGPT 对话

打开你想发送给 Codex 或导出的对话。

扩展读取的是浏览器当前标签页里打开的 ChatGPT 对话。

## 第 6 步：打开扩展弹窗

预期看到：

```text
已检测到 ChatGPT 对话
对话已读取
摘要已显示
```

如果本地服务未运行，也可以继续导出上下文包。

## 第 7 步：导出上下文包

1. 选择“导出为上下文包”。
2. 点击“导出包”。

预期：

```text
成功
浏览器下载 chatgpt-context-package-<conversation-slug>.zip
```

导出上下文包由浏览器扩展直接生成和下载，不需要手动启动 Bridge，也不需要添加 Codex 项目。

## 可选：直接导入到 Codex 项目

只有当你想把上下文直接写入某个 Codex 项目目录时，才需要本地 Bridge。

第一次设置：

```bash
pnpm build
pnpm --filter ./apps/bridge link --global
chatgpt-codex-bridge install-service
chatgpt-codex-bridge project add my-project /path/to/your/project
```

在 Mac 上，可以把文件夹拖到终端里，终端会自动粘贴完整路径。

设置完成后：

1. 选择“导入到 Codex 项目”。
2. 选择项目。
3. 点击“导入到 Codex”。

预期：

```text
成功
输出目录：<project-root>/.codex-context/chatgpt/<conversation-slug>/
```

## 第 8 步：在 Codex App 中使用

让 Codex 读取：

```text
Please read .codex-context/chatgpt/<conversation-slug>/CODEX_TASK.md first, then review assets_manifest.json and continue implementation based on that context.
```

## 第 9 步：在其他工具中使用上下文包

解压 zip，把文件夹给任何可以读取本地 Markdown 和文件的开发工具。

让工具读取：

```text
Please read CODEX_TASK.md first, then review full_conversation.md and assets_manifest.json.
```

## 资源说明

有些文件可能无法自动保存。如果发生这种情况，它们会在 `assets_manifest.json` 中标记为 unresolved 或 failed。对于部分 ChatGPT 图片、blob 链接或受保护文件，这是正常的。
