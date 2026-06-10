# ChatGPT Context Bridge for Codex

[English](README.md) | [中文](README.zh-CN.md)

ChatGPT Context Bridge for Codex moves the context of the ChatGPT conversation currently open in your browser into a local Codex project or a portable zip package.

It is local-first: the browser extension reads the active ChatGPT tab and can export a package directly through browser download. The local Bridge runs on `127.0.0.1` only when you want to import directly into a Codex project. The tool does not call private ChatGPT APIs and does not upload conversation content.

## Current Status

Milestone 1: Bridge core is implemented.
Milestone 2: Extension popup with mock payload and i18n is implemented.
Milestone 3: Real ChatGPT conversation extraction is implemented.
Milestone 4: Asset extraction, Codex project selection, package export, and full local usable flow are implemented.
Milestone 5: Production CLI, persistent local service commands, and user-level auto-start support are implemented.

## What Works Now

1. The extension can export a zip context package from the browser even when the local Bridge is not running.
2. Bridge runs locally on `127.0.0.1:17321` when direct Codex project import is needed.
3. Bridge manages multiple Codex project paths.
4. Extension supports English / Chinese switching.
5. Extension reads the currently opened ChatGPT conversation.
6. Extension extracts messages, code blocks, links, and asset references.
7. Extension / Bridge saves supported assets, including snippets, HTML / Markdown artifacts, and supported small data URL images.
8. Unresolved or failed assets are recorded in `assets_manifest.json`.
9. You can import directly into a detected or configured Codex project when the local Bridge is running.
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

Build the extension:

```bash
pnpm build:extension
```

Load `apps/extension/dist` as an unpacked extension in `chrome://extensions`.

Then:

1. Open the ChatGPT conversation you want to export.
2. Click the extension.
3. Confirm the ChatGPT conversation is detected.
4. Confirm conversation and asset summary are shown.
5. Choose `Export as package`.
6. Click `Export Package`.
7. The browser downloads `chatgpt-context-package-<conversation-slug>.zip`.

If you only need a zip context package, you do not need to start Bridge or add a Codex project.

If you want to import directly into a Codex project, do this one-time local service setup:

```bash
pnpm build
pnpm --filter ./apps/bridge link --global
chatgpt-codex-bridge install-service
```

The Bridge automatically discovers common local project folders. If your project does not appear in the extension, add it manually:

```bash
chatgpt-codex-bridge project add <id> <path>
```

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

Daily Codex import:
Open ChatGPT conversation
→ Open extension
→ Import to Codex
```

Package export does not need the local service. Open a ChatGPT conversation, open the extension, choose `Export as package`, and let the browser download the zip.

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

Manual project registry commands:

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
- The Bridge writes only inside selected detected or configured project directories.
- Browser-side package export only creates a downloaded zip; it does not write into arbitrary project folders.
- Path traversal is rejected.
- No conversation content is uploaded by this tool.
- Private ChatGPT APIs are intentionally not used.

See [Security](docs/security.md) for more detail.
