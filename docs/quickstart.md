# Quickstart for Non-technical Users

## Step 1: Download This Project

Open:

```text
https://github.com/afan914/chatgpt-codex-bridge
```

Click `Code`, choose `Download ZIP`, unzip it, then open Terminal in the unzipped `chatgpt-codex-bridge` folder.

If you already use Git:

```bash
git clone https://github.com/afan914/chatgpt-codex-bridge.git
cd chatgpt-codex-bridge
```

## Step 2: Install Dependencies

```bash
pnpm install
```

## Step 3: Start Bridge

```bash
pnpm dev:bridge
```

Keep this Terminal window open.

## Step 4: Add a Codex Project

If you want automatic Codex import, add your project folder:

```bash
chatgpt-codex-bridge project add my-project /path/to/your/project
```

On Mac, you can drag a folder into Terminal to paste its full path.

## Step 5: Build Extension

Open a new Terminal window in the project folder:

```bash
pnpm build:extension
```

## Step 6: Load Extension

1. Open `chrome://extensions`.
2. Enable Developer mode.
3. Click Load unpacked.
4. Select `apps/extension/dist`.

## Step 7: Open ChatGPT Conversation

Open the conversation you want to send to Codex or export.

The extension reads the ChatGPT conversation currently open in your browser tab.

## Step 8: Open Extension Popup

Expected:

```text
Local service connected
ChatGPT conversation detected
Conversation ready
Summary shown
```

## Step 9A: Import to Codex Project

1. Choose Import to Codex project.
2. Select project.
3. Click Import to Codex.

Expected:

```text
Success
Output directory: <project-root>/.codex-context/chatgpt/<conversation-slug>/
```

## Step 9B: Export as Package

1. Choose Export as package.
2. Click Export Package.

Expected:

```text
Success
Package path: ~/.chatgpt-codex-bridge/exports/chatgpt-context-package-<conversation-slug>.zip
```

## Step 10: Use in Codex App

Ask Codex:

```text
Please read .codex-context/chatgpt/<conversation-slug>/CODEX_TASK.md first, then review assets_manifest.json and continue implementation based on that context.
```

## Step 11: Use Package in Other Tools

Unzip the package and give the folder to any development tool that can read local Markdown and files.

Ask the tool:

```text
Please read CODEX_TASK.md first, then review full_conversation.md and assets_manifest.json.
```

## Asset Note

Some files may not be saved automatically. If that happens, they will be listed in `assets_manifest.json` as unresolved or failed. This is expected for some ChatGPT images, blob links, or protected files.
