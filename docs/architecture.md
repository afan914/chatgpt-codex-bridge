# Architecture

## Extension Responsibilities

The extension is responsible for browser-facing work:

- Provide the popup UI.
- Check local Bridge health.
- Read the current tab URL and title.
- Detect ChatGPT pages by URL.
- Provide runtime English / Simplified Chinese switching.
- Send the extracted conversation payload to the local Bridge.

The extension does not write files into the Codex project directory.

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
ChatGPT conversation DOM
-> Content script
-> Extract conversation payload
-> Popup
-> Bridge client
-> Local Bridge HTTP API
-> Context writer
-> Codex project .codex-context/
```

## Content Script Responsibilities

- Listen for extraction requests.
- Read the current page DOM.
- Extract message order.
- Detect message role.
- Extract readable text.
- Extract code blocks.
- Extract links.
- Detect unresolved asset references when simple.
- Return a typed payload to the popup.

The Bridge does not know how ChatGPT DOM is structured. DOM extraction lives only in the extension content script.

## Popup Responsibilities

- Show page, Bridge, and extraction status.
- Request extraction through `chrome.tabs.sendMessage`.
- Safely handle message failures.
- Show extraction summary.
- Send extracted payload to Bridge.
- Show success and error states.
- Support runtime i18n.

## Why a Local Bridge Is Needed

Browser extensions can inspect the current page, but local project file writes are best handled by a local process with explicit user configuration. The Bridge gives the extension a small local API for that file-writing step.

## Why `127.0.0.1`

The Bridge can write private conversation content into local project folders. Binding to `127.0.0.1` keeps the API local to the user's computer and avoids exposing write capabilities to the network.

## Why Not `chrome.i18n`

The extension uses a custom translation map instead of `chrome.i18n` because this project requires manual runtime language switching inside the popup. `chrome.i18n` follows browser locale and is not designed for this simple runtime toggle behavior.

## Content Script Build

The content script is built as a standalone IIFE-style bundle so it can run reliably as a Chrome content script. The final extension build emits:

```text
apps/extension/dist/content.js
```

The popup communicates with the content script using `chrome.tabs.sendMessage`. The popup must handle connection failures because the content script may not be available until the ChatGPT page is refreshed after extension reload.
