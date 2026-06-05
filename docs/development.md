# Development

## Local Setup

Install Node.js 20 or newer, then install dependencies:

```bash
pnpm install
```

## Workspace Commands

```bash
pnpm dev:bridge
pnpm build:bridge
pnpm build:extension
pnpm typecheck
pnpm lint
```

Extension build and lint scripts are placeholders in Milestone 1 and become real in Milestone 2.

## Run Bridge in Dev Mode

Initialize config:

```bash
pnpm dev:bridge -- init
```

Configure a project path:

```bash
pnpm dev:bridge -- config set-project /path/to/your/codex/project
```

Start the Bridge:

```bash
pnpm dev:bridge
```

## Build Extension

Milestone 1 contains only an extension workspace placeholder. In Milestone 2:

```bash
pnpm build:extension
```

will create `apps/extension/dist`.

## Load Unpacked Extension

This is available after Milestone 2:

1. Open `chrome://extensions`.
2. Turn on Developer mode.
3. Click "Load unpacked".
4. Select `apps/extension/dist`.

## Mock Payload Test

With the Bridge running:

```bash
curl -X POST http://127.0.0.1:17321/import-chatgpt-context \
  -H "Content-Type: application/json" \
  -d @examples/mock-payload.json
```

Expected output includes:

```json
{
  "ok": true,
  "conversationSlug": "atlas-plugin-discussion-abc123"
}
```

Expected files:

```text
<project-root>/.codex-context/chatgpt/atlas-plugin-discussion-abc123/
  CODEX_TASK.md
  README.md
  full_conversation.md
  manifest.json
  assets_manifest.json
  assets/snippets/
```

## Manual Pure Function Checks

Milestone 1 does not include a full test suite. These functions are pure and ready for unit tests:

- `createConversationSlug("Atlas plugin discussion", "https://chatgpt.com/c/abc123")` should return `atlas-plugin-discussion-abc123`.
- `sanitizeFilename("bad/name?.md")` should remove unsafe path characters.
- `validateImportPayload()` should reject empty `messages` with `EMPTY_MESSAGES`.
- `buildFullConversationMarkdown()` should preserve message order, links, and code blocks.
- `buildCodexTaskMarkdown()` should include source title, URL, and exported time.
