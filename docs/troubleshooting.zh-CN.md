# 故障排查

## Bridge 未连接

如果你只是想导出上下文包，可以不用启动 Bridge。选择“导出为上下文包”，浏览器会直接下载 zip。

如果你想导入到 Codex 项目，Bridge 必须运行。常见未连接原因是：

1. Bridge 没有运行。
2. 运行 Bridge 的终端窗口被关闭。
3. 端口 `17321` 被阻塞或占用。

启动一次 Bridge：

```bash
chatgpt-codex-bridge start
```

或安装自动启动服务：

```bash
chatgpt-codex-bridge install-service
```

然后测试：

```bash
curl http://127.0.0.1:17321/health
```

然后重新打开 popup。

## 本地服务没运行，但我只想导出包

可以继续使用扩展导出当前对话。

选择：

```text
导出为上下文包
```

浏览器会下载 `chatgpt-context-package-<conversation-slug>.zip`。

如果要直接导入 Codex 项目，再启动本地服务：

```bash
chatgpt-codex-bridge start
```

## 端口 `17321` 已被占用

停止已有的 Bridge 进程，或编辑：

```text
~/.chatgpt-codex-bridge/config.json
```

Milestone 1 不会自动选择其他端口，因为扩展默认期望访问 `17321`。

## 项目路径未配置

如果要导入 Codex 项目，先添加项目：

```bash
chatgpt-codex-bridge project add <id> /path/to/your/codex/project
```

## 当前页面不是 ChatGPT

只有在 ChatGPT 页面且提取成功后才能导入到 Codex。请打开：

```text
https://chatgpt.com
```

然后重新打开 popup。

## 导入到 Codex 按钮不可点击

可能原因：

1. 选择的是“导入到 Codex 项目”，但 Bridge 未连接。
2. Bridge 状态仍在检查。
3. 当前页面不是 ChatGPT。
4. 对话提取仍在进行或失败。
5. 未检测到消息。
6. 发送请求正在进行中。

请查看 popup 中的状态提示。

如果选择“导出为上下文包”，Bridge 未连接不应该阻止导出；请确认对话已读取成功。

## 浏览器没有下载上下文包

可能原因：

1. 浏览器阻止了下载。
2. 扩展缺少 `downloads` 权限。
3. zip 生成失败。
4. 对话未读取成功。
5. background service worker 没有响应。

修复方式：

1. 检查浏览器下载记录。
2. 重新加载扩展。
3. 刷新 ChatGPT 页面。
4. 重试导出。
5. 查看扩展 service worker 日志。

## 导出的包很大

部分对话可能包含大型 data URL 或生成资源。

扩展会跳过超过限制的大型 data URL 图片，并在 `assets_manifest.json` 中记录为 unresolved。

## 语言没有保留

可能原因：

1. 浏览器阻止了扩展 storage。
2. 扩展被重新加载。
3. storage 写入失败。

请重新加载扩展并再次切换语言。

## 未检测到消息

可能原因：

1. 对话为空。
2. 页面仍在加载。
3. DOM selector 已不匹配。
4. 当前是 ChatGPT 页面，但不是具体对话页。

修复方式：

1. 打开一个具体 ChatGPT 对话。
2. 刷新页面。
3. 重试。

## 对话提取失败

可能原因：

1. ChatGPT 页面还没有完全加载。
2. 页面加载后扩展被重新加载过。
3. content script 不可用。
4. ChatGPT DOM 发生变化。
5. 当前页面不是具体对话页。

修复方式：

1. 刷新 ChatGPT 页面。
2. 等待对话可见。
3. 重新打开 popup。
4. 点击重试提取。

## 代码块缺失

当前版本会提取常见的 `pre code` 代码块。如果 ChatGPT 改变代码块结构，可能需要更新 selector。

## 链接缺失

当前版本会提取标准 anchor 链接。一些 UI 生成的链接可能不会被包含。

## Assets 未解析

当前版本会尽力保存支持的资源，并把无法自动保存的资源记录到 `assets_manifest.json`。

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

## Content Script 不可用

如果 popup 提示无法访问 ChatGPT 页面，可能是 content script 没有注入。

常见原因：

1. 你在 ChatGPT 页面已经打开后，才加载或重新加载扩展。
2. ChatGPT 页面尚未加载完成。
3. 浏览器没有注入 content script。
4. content script 构建失败，或缺少 `content.js`。

修复方式：

1. 刷新 ChatGPT 页面。
2. 重新打开扩展 popup。
3. 如果仍然失败，进入 `chrome://extensions` 重新加载扩展，然后再次刷新 ChatGPT。
4. 确认 `apps/extension/dist/content.js` 存在。
5. 确认 `apps/extension/dist/manifest.json` 引用了 `content.js`。
