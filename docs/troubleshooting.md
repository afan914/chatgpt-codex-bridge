# Troubleshooting

## Local Service Disconnected

Start the Bridge:

```bash
pnpm dev:bridge
```

Then test:

```bash
curl http://127.0.0.1:17321/health
```

## Port `17321` Already in Use

Another Bridge process may already be running. Stop it or edit:

```text
~/.chatgpt-codex-bridge/config.json
```

The extension expects `127.0.0.1:17321`.

## No Codex Project Configured

Fix:

```bash
chatgpt-codex-bridge project add <id> <path>
chatgpt-codex-bridge project set-default <id>
```

## Project List Is Empty in Popup

Possible causes:

1. No project configured.
2. Bridge is not running.
3. `/projects` endpoint failed.

Fix:

```bash
chatgpt-codex-bridge project list
```

Add a project if needed.

## Project Selection Resets Unexpectedly

The popup should wait for both the Bridge project list and stored selected project ID before choosing a fallback project.

If selection resets, reload the extension and confirm the latest version is running.

## Package Export Failed

Possible causes:

1. Export directory is not writable.
2. Zip creation failed.
3. Asset writing failed unexpectedly.

Fix:

1. Check Bridge terminal logs.
2. Check `~/.chatgpt-codex-bridge/exports/`.
3. Retry export.

## Some Assets Are Unresolved

Some assets cannot be saved automatically because they are blob URLs, protected URLs, or require ChatGPT internal access.

Fix:

1. Check `assets_manifest.json`.
2. Manually download the asset from ChatGPT if needed.
3. Place it into the project if Codex needs it.

## Asset Save Failed

Possible causes:

1. Unsupported URL.
2. Invalid filename.
3. Write permission issue.
4. Unsupported MIME type.
5. Data URL decoding failed.

Fix:

1. Check `failureReason` in `assets_manifest.json`.
2. Confirm project folder is writable.
3. Retry.

## HTML or Markdown Artifact Not Saved

Possible causes:

1. Code block language was not labeled as `html`, `md`, or `markdown`.
2. The content was not inside a code block.
3. ChatGPT rendered it as an artifact not visible in the DOM.

Fix:

1. Check `full_conversation.md`.
2. Check `assets_manifest.json`.
3. If needed, copy the artifact manually.

## Current Page Is Not a ChatGPT Conversation

Open a specific conversation at `https://chatgpt.com/c/...`, wait until it loads, then reopen the popup.

## Conversation Read Failed

Refresh the ChatGPT page after reloading the extension, then reopen the popup and retry.
