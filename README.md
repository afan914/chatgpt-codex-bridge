# ChatGPT Context Bridge for Codex

[English](README.md) | [中文](README.zh-CN.md)

ChatGPT Context Bridge for Codex moves the context of the ChatGPT conversation currently open in your browser into a local Codex project or a portable zip package.

It is local-first: the browser extension reads the active ChatGPT tab, the Bridge runs on `127.0.0.1`, and generated files are written on your computer. The tool does not call private ChatGPT APIs and does not upload conversation content.

## Current Status

Milestone 1: Bridge core is implemented.
Milestone 2: Extension popup with mock payload and i18n is implemented.
Milestone 3: Real ChatGPT conversation extraction is implemented.
Milestone 4: Asset extraction, Codex project selection, package export, and full local usable flow are implemented.

## What Works Now

1. Bridge runs locally on `127.0.0.1:17321`.
2. Bridge manages multiple Codex project paths.
3. Extension popup connects to the local Bridge.
4. Extension supports English / Chinese switching.
5. Extension reads the currently opened ChatGPT conversation.
6. Extension extracts messages, code blocks, links, and asset references.
7. Extension / Bridge saves supported assets, including snippets, HTML / Markdown artifacts, and supported data URL images.
8. Unresolved or failed assets are recorded in `assets_manifest.json`.
9. You can import directly into a selected Codex project.
10. You can export a zip package for other tools or manual use.

## Full Local Flow

Clone this repository:

```bash
git clone https://github.com/afan914/chatgpt-codex-bridge.git
cd chatgpt-codex-bridge
```

Install dependencies:

```bash
pnpm install
```

Start the local Bridge:

```bash
pnpm dev:bridge
```

In another Terminal, add a Codex project:

```bash
chatgpt-codex-bridge project add <id> <path>
```

Build the extension:

```bash
pnpm build:extension
```

Load `apps/extension/dist` as an unpacked extension in `chrome://extensions`.

Then:

1. Open the ChatGPT conversation you want to export.
2. Click the extension.
3. Confirm the local service is connected.
4. Confirm the ChatGPT conversation is detected.
5. Confirm conversation and asset summary are shown.
6. Choose `Import to Codex project` or `Export as package`.
7. Click the main action.
8. Open the generated `.codex-context/chatgpt/` folder or exported package.

## Running the Bridge

During local development:

```bash
pnpm dev:bridge
```

Project registry commands:

```bash
chatgpt-codex-bridge project list
chatgpt-codex-bridge project add <id> <path>
chatgpt-codex-bridge project remove <id>
chatgpt-codex-bridge project set-default <id>
```

The older shortcut still works:

```bash
chatgpt-codex-bridge config set-project /path/to/project
```

## Loading the Extension

```bash
pnpm build:extension
```

Then:

1. Open `chrome://extensions`.
2. Enable Developer mode.
3. Click Load unpacked.
4. Select `apps/extension/dist`.

## Current Limitations

Some ChatGPT assets may remain unresolved, especially blob URLs, protected URLs, or artifacts that require private ChatGPT backend access. The tool records these in `assets_manifest.json` instead of silently dropping them.

Duplicate imports overwrite the deterministic conversation folder for that project.

## Security Notes

- The Bridge binds only to `127.0.0.1`.
- The Bridge writes only inside explicitly configured project directories or the local export directory.
- Path traversal is rejected.
- No conversation content is uploaded by this tool.
- Private ChatGPT APIs are intentionally not used.

See [Security](docs/security.md) for more detail.
