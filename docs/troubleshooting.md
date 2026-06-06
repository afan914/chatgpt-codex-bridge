# Troubleshooting

## Bridge Disconnected

If the extension popup says Bridge disconnected, common causes are:

1. Bridge is not running.
2. The Terminal window running Bridge was closed.
3. Port `17321` is blocked or occupied.

Start the Bridge:

```bash
pnpm dev:bridge
```

Then test:

```bash
curl http://127.0.0.1:17321/health
```

Then reopen the popup.

## Port `17321` Already in Use

Stop the existing Bridge process or edit:

```text
~/.chatgpt-codex-bridge/config.json
```

Milestone 1 does not auto-select another port because the extension expects `17321`.

## Project Path Not Configured

Run:

```bash
pnpm dev:bridge -- config set-project /path/to/your/codex/project
```

## Current Page Is Not ChatGPT

Send to Codex is enabled only on ChatGPT pages after extraction succeeds. Open:

```text
https://chatgpt.com
```

Then reopen the popup.

## Send to Codex Button Is Disabled

Possible causes:

1. Bridge disconnected.
2. Bridge status is still checking.
3. Current page is not ChatGPT.
4. Conversation extraction is still running or failed.
5. No messages were detected.
6. Send request is already in progress.

Check the status messages in the popup.

## Language Does Not Persist

Possible causes:

1. Browser blocked extension storage.
2. Extension was reloaded.
3. Storage write failed.

Reload the extension and switch language again.

## No Messages Detected

Possible causes:

1. The conversation is empty.
2. The page is still loading.
3. DOM selectors no longer match.
4. You are on a ChatGPT page but not a conversation page.

Fix:

1. Open a specific ChatGPT conversation.
2. Refresh the page.
3. Try again.

## Conversation Extraction Failed

Possible causes:

1. ChatGPT page has not fully loaded.
2. Extension was reloaded after the page loaded.
3. Content script is unavailable.
4. ChatGPT DOM changed.
5. Current page is not a conversation page.

Fix:

1. Refresh the ChatGPT page.
2. Wait until the conversation is visible.
3. Reopen the popup.
4. Click Retry extraction.

## Code Blocks Missing

Milestone 3 extracts common `pre code` blocks. If ChatGPT changes its code block structure, extraction may need selector updates.

## Links Missing

Milestone 3 extracts standard anchor links. Some UI-generated links may not be included.

## Assets Unresolved

Milestone 3 may detect images or downloadable links but does not download files yet. Full asset extraction is planned for Milestone 4.

## CORS Error

The Bridge sends these CORS headers in Milestone 1:

```text
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

If the browser still reports CORS issues, confirm the Bridge is running and that requests target:

```text
http://127.0.0.1:17321
```

## Extension Cannot Be Loaded

Build it with:

```bash
pnpm build:extension
```

Then load `apps/extension/dist` from `chrome://extensions`.

Make sure you selected `apps/extension/dist`, not `apps/extension`.

## Extension Build Output Missing `manifest.json`

Run:

```bash
pnpm build:extension
```

Then check:

```text
apps/extension/dist/manifest.json
```

If it is missing, inspect the Vite manifest copy plugin in `apps/extension/vite.config.ts`.

## Content Script Unavailable

If the popup says it cannot access the ChatGPT page, the content script may not have been injected.

Common causes:

1. You loaded or reloaded the extension after the ChatGPT page was already open.
2. The ChatGPT page has not finished loading.
3. The browser did not inject the content script.
4. The content script build failed or `content.js` is missing.

Fix:

1. Refresh the ChatGPT page.
2. Reopen the extension popup.
3. If it still fails, go to `chrome://extensions`, reload the extension, then refresh ChatGPT again.
4. Make sure `apps/extension/dist/content.js` exists.
5. Make sure `apps/extension/dist/manifest.json` references `content.js`.
