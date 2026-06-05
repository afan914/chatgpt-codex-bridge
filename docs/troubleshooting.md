# Troubleshooting

## Bridge Disconnected

Start the Bridge:

```bash
pnpm dev:bridge
```

Then test:

```bash
curl http://127.0.0.1:17321/health
```

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

This message belongs to the extension flow in Milestone 2 and 3. Open a conversation under:

```text
https://chatgpt.com/c/<id>
https://chat.openai.com/c/<id>
```

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

The extension is implemented in Milestone 2. After that milestone, build it with:

```bash
pnpm build:extension
```

Then load `apps/extension/dist` from `chrome://extensions`.
