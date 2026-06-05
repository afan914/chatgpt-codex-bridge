# Architecture

## Extension Responsibilities

The extension is responsible for browser-facing work:

- Detect whether the active page is a ChatGPT conversation.
- Extract visible conversation content from the current page DOM.
- Provide the popup UI and runtime English / Simplified Chinese switching.
- Send a validated payload shape to the local Bridge.

The extension does not write files into the Codex project directory.

## Bridge Responsibilities

The Bridge is a local Node.js CLI and HTTP server. It:

- Reads config from `~/.chatgpt-codex-bridge/config.json`.
- Listens on `127.0.0.1:17321`.
- Handles `/health`.
- Handles `/import-chatgpt-context`.
- Validates incoming payloads.
- Writes deterministic context exports under `.codex-context/chatgpt/`.

The Bridge does not know ChatGPT DOM selectors and does not call ChatGPT APIs.

## Shared Package Responsibilities

The shared package owns code used by both apps:

- Payload and response types.
- Asset and config types.
- Payload validation.
- Conversation slug helpers.
- Filename sanitization helpers.
- URL helpers.
- Lightweight i18n translations and `t(locale, key)`.

## Data Flow

```text
ChatGPT conversation page
-> Browser extension extracts current conversation
-> Extension POSTs payload to http://127.0.0.1:17321/import-chatgpt-context
-> Bridge validates payload and config
-> Bridge writes files into <project-root>/.codex-context/chatgpt/<conversation-slug>/
-> Codex App reads CODEX_TASK.md and full_conversation.md
```

## Why a Local Bridge Is Needed

Browser extensions can inspect the current page, but local project file writes are best handled by a local process with explicit user configuration. The Bridge gives the extension a small local API for that file-writing step.

## Why `127.0.0.1`

The Bridge can write private conversation content into local project folders. Binding to `127.0.0.1` keeps the API local to the user's computer and avoids exposing write capabilities to the network.
