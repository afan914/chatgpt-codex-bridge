# ChatGPT Context Bridge for Codex

[English](README.md) | [中文](README.zh-CN.md)

ChatGPT Context Bridge for Codex is a local-first project for moving the context of a ChatGPT conversation into a Codex project directory.

It exists because a user may plan, discuss, and refine implementation details in ChatGPT, then use Codex App to build the actual project. The MVP closes that context gap without manual copying, exporting, downloading, or cloud sync.

The project now includes a local Bridge CLI, a Manifest V3 browser extension popup, a mock Send to Codex flow, runtime English / Chinese switching, and a local-only architecture.

## Current Status

Milestone 1: Bridge core is implemented.
Milestone 2: Extension popup with mock payload and i18n is implemented.
Milestone 3: Real ChatGPT DOM extraction is not implemented yet.
Milestone 4: Real asset extraction is not implemented yet.

## Architecture

The project is split into three responsibilities:

- Browser extension: shows a popup, checks Bridge health, detects ChatGPT pages by URL, switches EN / 中文 at runtime, and sends a mock payload to the local Bridge.
- Local Bridge CLI: runs on `127.0.0.1:17321`, validates payloads, and writes context files into a configured Codex project directory.
- Shared package: owns shared TypeScript types, validation, slug helpers, filename helpers, URL helpers, and popup i18n helpers.

The Bridge never extracts browser DOM directly, never calls private ChatGPT APIs, and never uploads conversation content to a remote service.

## Quick Start

Clone this repository:

```bash
git clone https://github.com/afan914/chatgpt-codex-bridge.git
cd chatgpt-codex-bridge
```

Or download it from GitHub:

```text
https://github.com/afan914/chatgpt-codex-bridge
```

Click Code -> Download ZIP, unzip it, then open Terminal in the unzipped project folder.

Install dependencies:

```bash
pnpm install
```

Create the Bridge config:

```bash
pnpm dev:bridge -- init
```

Configure your Codex project directory:

```bash
pnpm dev:bridge -- config set-project /path/to/your/codex/project
```

Start the Bridge:

```bash
pnpm dev:bridge
```

Build the extension:

```bash
pnpm build:extension
```

Test health:

```bash
curl http://127.0.0.1:17321/health
```

Test import with the mock payload:

```bash
curl -X POST http://127.0.0.1:17321/import-chatgpt-context \
  -H "Content-Type: application/json" \
  -d @examples/mock-payload.json
```

Generated files should appear under:

```text
<project-root>/.codex-context/chatgpt/atlas-plugin-discussion-abc123/
```

If you are not familiar with Terminal, Node.js, or browser extensions, start with the non-technical quickstart:
[Quickstart for Non-technical Users](docs/quickstart.md)

## Running the Bridge

The Bridge CLI command is:

```bash
chatgpt-codex-bridge
```

During local development, use:

```bash
pnpm dev:bridge
```

Supported commands:

```bash
pnpm dev:bridge -- init
pnpm dev:bridge -- start
pnpm dev:bridge -- status
pnpm dev:bridge -- config set-project /path/to/project
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

## Using the Popup

1. Start the Bridge with `pnpm dev:bridge`.
2. Open ChatGPT in Atlas / Chromium.
3. Open the extension popup.
4. Confirm Bridge connected.
5. Confirm ChatGPT page detected.
6. Switch EN / 中文 if needed.
7. Click Send to Codex.
8. Check `<project-root>/.codex-context/chatgpt/`.

## Current Limitations

- Milestone 2 still uses a mock payload. It does not yet extract the real ChatGPT conversation DOM.
- Real ChatGPT DOM extraction is not implemented until Milestone 3.
- Image and file extraction are represented as unresolved asset references in the MVP.
- Duplicate imports overwrite the deterministic conversation folder.

## Security Notes

- The Bridge binds only to `127.0.0.1`.
- The Bridge writes only inside the configured project directory.
- Path traversal is rejected.
- No conversation content is uploaded by this tool.
- Private ChatGPT APIs are intentionally not used.

See [Security](docs/security.md) for more detail.
