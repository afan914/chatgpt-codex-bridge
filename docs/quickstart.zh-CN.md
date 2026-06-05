# 非技术用户快速开始

## 你将要设置什么

你会在自己的电脑上设置两个本地组件：

- 浏览器扩展弹窗检查 ChatGPT 页面，并发送 mock 对话 payload。
- 本地 Bridge 在你的电脑上运行。
- Bridge 把对话上下文写入你的 Codex 项目文件夹。
- 这个工具不会把内容上传到远程服务器。

Milestone 2 包含本地 Bridge 和浏览器扩展弹窗。真实 ChatGPT 对话提取会在 Milestone 3 实现。

## 第 1 步：安装 Node.js

打开 https://nodejs.org，安装 LTS 版本。

安装后，打开终端，运行：

```bash
node --version
npm --version
```

预期输出：

```text
v20.x.x
10.x.x
```

具体数字可能不同。如果终端提示 `command not found`，请关闭终端，重新打开后再试。

## 第 2 步：安装 pnpm

运行：

```bash
npm install -g pnpm
```

然后验证：

```bash
pnpm --version
```

如果失败，可能是 Node.js 或 npm 没有正确安装。

## 第 3 步：下载本项目

### 方式 A：从 GitHub 下载 ZIP

打开：

```text
https://github.com/afan914/chatgpt-codex-bridge
```

点击绿色的 “Code” 按钮，选择 “Download ZIP”，然后解压。打开终端并进入解压后的文件夹。

### 方式 B：使用 git clone

如果你已经安装 Git：

```bash
git clone https://github.com/afan914/chatgpt-codex-bridge.git
cd chatgpt-codex-bridge
```

## 第 4 步：安装项目依赖

运行：

```bash
cd chatgpt-codex-bridge
pnpm install
```

这会下载项目需要的依赖库，可能需要几分钟。

## 第 5 步：配置你的 Codex 项目文件夹

运行：

```bash
pnpm dev:bridge -- init
pnpm dev:bridge -- config set-project /path/to/your/codex/project
```

把 `/path/to/your/codex/project` 替换为你的 Codex 项目所在文件夹。

在 Mac 上，你可以把文件夹拖进终端，终端会自动粘贴完整路径。

预期输出会提示默认项目路径已经设置。

## 第 6 步：启动 Bridge

运行：

```bash
pnpm dev:bridge
```

预期输出：

```text
ChatGPT Codex Bridge running at http://127.0.0.1:17321
```

使用扩展时，请保持这个终端窗口打开。

## 第 7 步：构建扩展

打开一个新的终端窗口，运行：

```bash
pnpm build:extension
```

这个命令会在下面目录生成浏览器扩展文件：

```text
apps/extension/dist
```

## 第 8 步：在 Atlas / Chrome / Arc 中加载扩展

1. 打开浏览器。
2. 进入：

```text
chrome://extensions
```

3. 打开 “Developer mode”。
4. 点击 “Load unpacked”。
5. 选择：

```text
chatgpt-codex-bridge/apps/extension/dist
```

## 第 9 步：测试完整流程

1. 打开一个 ChatGPT 对话。
2. 点击扩展图标。
3. 确认：

   * Bridge connected
   * ChatGPT page detected
4. 如有需要，切换语言。
5. 点击 “Send to Codex”。
6. 打开你配置的 Codex 项目文件夹。
7. 检查是否存在：

```text
.codex-context/chatgpt/
```

当前阶段，Send to Codex 使用 mock conversation payload。这用于验证扩展可以和本地 Bridge 通信。下一阶段扩展会提取真实 ChatGPT 对话。

你也可以用下面命令直接测试 Bridge：

```bash
curl -X POST http://127.0.0.1:17321/import-chatgpt-context \
  -H "Content-Type: application/json" \
  -d @examples/mock-payload.json
```

## 第 10 步：在 Codex App 中使用

在 Codex App 中，让 Codex 先读取：

```text
.codex-context/chatgpt/<conversation-slug>/CODEX_TASK.md
```

然后基于这份上下文继续实现。

## 故障排查

请阅读：

```text
docs/troubleshooting.zh-CN.md
```
