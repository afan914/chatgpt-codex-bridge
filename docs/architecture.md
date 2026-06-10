# Architecture

## Data Flow

```text
Current ChatGPT conversation tab
-> Content script
-> Extract messages, code, links, asset references
-> Popup
-> Destination selection
-> Import path OR package export path
```

Codex project import:

```text
Popup
-> Bridge client
-> Local Bridge HTTP API
-> Context writer
-> Asset writer
-> Codex project .codex-context/
```

Package export:

```text
Popup
-> Background service worker
-> Browser-side JSZip package builder
-> chrome.downloads.download
-> Browser download
```

## Content Script

The content script:

1. Extracts the visible current conversation.
2. Extracts text.
3. Extracts code blocks.
4. Extracts links.
5. Detects asset references.
6. Packages the payload.
7. Never calls private ChatGPT APIs.

DOM extraction lives only in the extension. The Bridge does not know ChatGPT selectors.

## Popup

The popup:

1. Shows current page status.
2. Shows local service status.
3. Shows conversation read status.
4. Shows extraction summary.
5. Loads the Bridge project list only when the Bridge is connected.
6. Lets the user select destination.
7. Sends Codex imports to the Bridge or package export requests to the background service worker.
8. Shows success / error state.
9. Supports i18n.

## Bridge

The Bridge is a local Node.js CLI and HTTP server. It:

1. Validates payloads.
2. Keeps `destination` backward-compatible and optional.
3. Manages configured projects.
4. Resolves destination.
5. Generates export folders.
6. Writes conversation Markdown.
7. Writes snippets.
8. Writes supported assets.
9. Generates asset manifests.
10. Records unresolved and failed assets.
11. Enforces local-only path safety.

The Bridge is required for `Import to Codex project`. It is not required for the normal `Export as package` button.

## Browser-side Package Export

Package export always runs in the extension background service worker. JSZip is bundled from npm and no CDN or remote script is loaded. The background worker creates the zip and calls `chrome.downloads.download`; the popup only triggers the request and shows status.

Browser-side export cannot write directly into arbitrary local project folders. Use the Bridge for direct Codex project import.

## Asset Writer

The asset writer only writes inside the selected context output directory, such as a configured Codex project export folder or the browser-side zip package structure. It saves content-based assets such as HTML and Markdown blocks, decodes supported data URL images, and records unresolved assets in `assets_manifest.json`.

## Shared Package

The shared package owns:

- Payload, destination, asset, config, and response types.
- Payload validation.
- Central asset failure reasons.
- Pure package generation functions for Markdown and manifests.
- Slug and filename helpers.
- URL helpers.
- i18n translations and `t(locale, key)`.

## Local API

```text
GET  /health
GET  /projects
POST /import-chatgpt-context
```

The Bridge binds to `127.0.0.1:17321`.
