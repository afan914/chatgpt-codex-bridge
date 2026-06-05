# ChatGPT Context Bridge for Codex

ChatGPT Context Bridge for Codex is a local-first project for moving the context of a ChatGPT conversation into a Codex project directory.

It exists because a user may plan, discuss, and refine implementation details in ChatGPT, then use Codex App to build the actual project. The MVP closes that context gap without manual copying, exporting, downloading, or cloud sync.

## Architecture

The project is split into three responsibilities:

- Browser extension: reads the current ChatGPT conversation page and sends a payload to the local Bridge. This starts in Milestone 2.
- Local Bridge CLI: runs on `127.0.0.1:17321`, validates payloads, and writes context files into a configured Codex project directory.
- Shared package: owns shared TypeScript types, validation, slug helpers, filename helpers, URL helpers, and popup i18n helpers.

The Bridge never extracts browser DOM directly, never calls private ChatGPT APIs, and never uploads conversation content to a remote service.

## Quick Start

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

The browser extension is planned for Milestone 2. Milestone 1 includes an extension workspace placeholder only.

After Milestone 2, the expected flow will be:

```bash
pnpm build:extension
```

Then load `apps/extension/dist` from `chrome://extensions` using "Load unpacked".

## Current Limitations

- Milestone 1 implements the Bridge core and shared package only.
- The extension popup is not implemented until Milestone 2.
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
