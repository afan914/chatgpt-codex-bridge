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

Milestone 2 only enables Send to Codex on ChatGPT pages. Open:

```text
https://chatgpt.com
```

Then reopen the popup.

## Send to Codex Button Is Disabled

Possible causes:

1. Bridge disconnected.
2. Bridge status is still checking.
3. Current page is not ChatGPT.
4. Send request is already in progress.

Check the status messages in the popup.

## Language Does Not Persist

Possible causes:

1. Browser blocked extension storage.
2. Extension was reloaded.
3. Storage write failed.

Reload the extension and switch language again.

## No Messages Detected

Real DOM extraction starts in Milestone 3. If this appears later, refresh the ChatGPT page and verify that the conversation messages are visible.

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
