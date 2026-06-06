# Development

## Build and Run

```bash
pnpm install
pnpm dev:bridge
pnpm build:extension
pnpm typecheck
```

## Project Registry Commands

```bash
chatgpt-codex-bridge project list
chatgpt-codex-bridge project add <id> <path>
chatgpt-codex-bridge project remove <id>
chatgpt-codex-bridge project set-default <id>
```

By default, project name equals project ID.

The backward-compatible shortcut still works:

```bash
chatgpt-codex-bridge config set-project /path/to/project
```

## Test Project API

```bash
curl http://127.0.0.1:17321/projects
```

## Test Backward-compatible Old Payload

Old payload without `destination` should still work:

```bash
curl -X POST http://127.0.0.1:17321/import-chatgpt-context \
  -H "Content-Type: application/json" \
  -d @examples/mock-payload.json
```

If no project is configured, expected error code is `NO_PROJECT_CONFIGURED`.

## Load Extension

```text
chrome://extensions -> Developer mode -> Load unpacked -> apps/extension/dist
```

## Test Project Selector Race Behavior

1. Configure two projects.
2. Select the second project in popup.
3. Close and reopen popup.
4. Confirm selected project remains the second project.
5. Confirm it is not overwritten by the default project.

## Test Codex Import Mode

1. Add a project.
2. Start Bridge.
3. Open ChatGPT conversation.
4. Open popup.
5. Select Import to Codex project.
6. Select project.
7. Click Import to Codex.
8. Inspect:

```text
<project-path>/.codex-context/chatgpt/
```

## Test Package Export Mode

1. Start Bridge.
2. Open ChatGPT conversation.
3. Open popup.
4. Select Export as package.
5. Click Export Package.
6. Inspect:

```text
~/.chatgpt-codex-bridge/exports/
```

## Test Asset Manifest

Verify:

1. Saved assets have filenames.
2. Unresolved assets have reasons.
3. Failed assets have failure reasons.
4. No detected asset is silently dropped.

## Test Vite Build Output

After `pnpm build:extension`, confirm:

```text
apps/extension/dist/manifest.json
apps/extension/dist/popup.html
apps/extension/dist/serviceWorker.js
apps/extension/dist/content.js
```
