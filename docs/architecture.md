# Architecture

## Extension Responsibilities

The extension is responsible for browser-facing work:

- Provide the popup UI.
- Check local Bridge health.
- Read the current tab URL and title.
- Detect ChatGPT pages by URL.
- Provide runtime English / Simplified Chinese switching.
- Send a mock payload to the local Bridge in Milestone 2.

The extension does not write files into the Codex project directory.

In Milestone 2, the extension does not yet read the real ChatGPT DOM. The popup only verifies the browser extension -> Bridge -> project directory integration by sending a mock payload.

## Bridge Responsibilities

The Bridge is a local Node.js CLI and HTTP server. It:

- Reads config from `~/.chatgpt-codex-bridge/config.json`.
- Listens on `127.0.0.1:17321`.
- Handles `/health`.
- Handles `/import-chatgpt-context`.
- Validates incoming payloads.
- Generates deterministic conversation slugs.
- Writes deterministic context exports under `.codex-context/chatgpt/`.
- Enforces path safety.
- Returns structured success and error responses.

The Bridge does not know ChatGPT DOM selectors and does not call ChatGPT APIs.

## Shared Package Responsibilities

The shared package owns code used by both apps:

- Payload and response types.
- Asset and config types.
- Payload validation.
- Conversation slug helpers.
- Filename sanitization helpers.
- URL helpers.
- i18n types.
- Translation map.
- Lightweight i18n translations and `t(locale, key)`.

## Data Flow

```text
ChatGPT page
-> Extension popup
-> Mock payload builder
-> Bridge client
-> Local Bridge HTTP API
-> Context writer
-> Codex project .codex-context/
```

## Why a Local Bridge Is Needed

Browser extensions can inspect the current page, but local project file writes are best handled by a local process with explicit user configuration. The Bridge gives the extension a small local API for that file-writing step.

## Why `127.0.0.1`

The Bridge can write private conversation content into local project folders. Binding to `127.0.0.1` keeps the API local to the user's computer and avoids exposing write capabilities to the network.

## Why Not `chrome.i18n`

The extension uses a custom translation map instead of `chrome.i18n` because this project requires manual runtime language switching inside the popup. `chrome.i18n` follows browser locale and is not designed for this simple runtime toggle behavior.
