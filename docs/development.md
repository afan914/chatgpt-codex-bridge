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

Extension build and lint scripts are implemented in Milestone 2.

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

```bash
pnpm build:extension
```

Expected output:

```text
apps/extension/dist/
```

## Load Unpacked Extension

1. Open `chrome://extensions`.
2. Turn on Developer mode.
3. Click "Load unpacked".
4. Select `apps/extension/dist`.

## Test Bridge Health from Popup

1. Start Bridge:

```bash
pnpm dev:bridge
```

2. Open the extension popup.
3. Confirm Bridge connected.

## Test Disconnected State

1. Stop Bridge.
2. Reopen the popup.
3. Confirm Bridge disconnected.

## Test Send to Codex with Mock Payload

1. Start Bridge.
2. Open a ChatGPT page.
3. Open the popup.
4. Click Send to Codex.
5. Confirm files appear in:

```text
<project-root>/.codex-context/chatgpt/
```

Milestone 2 sends a mock payload. Real ChatGPT DOM extraction starts in Milestone 3.

## Test i18n

1. Open the popup.
2. Switch EN / 中文.
3. Close the popup.
4. Reopen the popup.
5. Confirm the selected language persists.

## Test Vite Build Output

After `pnpm build:extension`, confirm these files exist:

```text
apps/extension/dist/manifest.json
apps/extension/dist/popup.html
apps/extension/dist/serviceWorker.js
```

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
