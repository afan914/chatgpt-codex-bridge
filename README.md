# ChatGPT Context Bridge for Codex

[English](README.md) | [中文](README.zh-CN.md)

ChatGPT Context Bridge for Codex moves the context of the ChatGPT conversation currently open in your browser into a local Codex project or a portable zip package.

It is local-first: the browser extension reads the active ChatGPT tab, the Bridge runs on `127.0.0.1`, and generated files are written on your computer. The tool does not call private ChatGPT APIs and does not upload conversation content.

## Current Status

Milestone 1: Bridge core is implemented.
Milestone 2: Extension popup with mock payload and i18n is implemented.
Milestone 3: Real ChatGPT conversation extraction is implemented.
Milestone 4: Asset extraction, Codex project selection, package export, and full local usable flow are implemented.
Milestone 5: Production CLI, persistent local service commands, and user-level auto-start support are implemented.

## What Works Now

1. Bridge runs locally on `127.0.0.1:17321`.
2. Bridge manages multiple Codex project paths.
3. Extension popup connects to the local Bridge.
4. Extension supports English / Chinese switching.
5. Extension reads the currently opened ChatGPT conversation.
6. Extension extracts messages, code blocks, links, and asset references.
7. Extension / Bridge saves supported assets, including snippets, HTML / Markdown artifacts, and supported small data URL images.
8. Unresolved or failed assets are recorded in `assets_manifest.json`.
9. You can import directly into a selected Codex project when the local Bridge is running.
10. You can export a zip package from the browser even when the local Bridge is not running.

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

Build and link the CLI for local use:

```bash
pnpm build
pnpm --filter ./apps/bridge link --global
```

Start the local Bridge once, or install the user-level auto-start service:

```bash
chatgpt-codex-bridge start
chatgpt-codex-bridge install-service
```

Add a Codex project:

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
3. Confirm the local service is connected if you want direct Codex import. If it is disconnected, package export still works.
4. Confirm the ChatGPT conversation is detected.
5. Confirm conversation and asset summary are shown.
6. Choose `Import to Codex project` or `Export as package`.
7. Click the main action.
8. Open the generated `.codex-context/chatgpt/` folder or downloaded package.

`Import to Codex project` requires the local Bridge because it writes to local project paths. `Export as package` always uses browser-side package generation and browser download, so it does not require Bridge.

## Running the Bridge as a Local Service

The CLI is production-ready for local use. npm publishing may be added later. For local development linking:

```bash
pnpm build
pnpm --filter ./apps/bridge link --global
```

Future npm global installation is expected to use:

```bash
npm install -g chatgpt-codex-bridge
```

Daily usage:

```text
First-time:
chatgpt-codex-bridge install-service

Daily:
Open ChatGPT conversation
→ Open extension
→ Import to Codex / Export package
```

CLI commands:

```bash
chatgpt-codex-bridge start
chatgpt-codex-bridge status
chatgpt-codex-bridge stop
chatgpt-codex-bridge install-service
chatgpt-codex-bridge uninstall-service
```

During local development only:

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
