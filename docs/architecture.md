# Architecture

## Data Flow

```text
Current ChatGPT conversation tab
-> Content script
-> Extract messages, code, links, asset references
-> Popup
-> Destination selection
-> Bridge client
-> Local Bridge HTTP API
-> Context writer
-> Asset writer
-> Codex project .codex-context/ OR exported zip package
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
5. Loads the Bridge project list.
6. Lets the user select destination.
7. Sends payload with destination.
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
11. Creates zip packages when requested.
12. Enforces local-only path safety.

## Asset Writer

The asset writer only writes inside the export directory. It saves content-based assets such as HTML and Markdown blocks, decodes supported data URL images, and records unresolved assets in `assets_manifest.json`.

## Shared Package

The shared package owns:

- Payload, destination, asset, config, and response types.
- Payload validation.
- Central asset failure reasons.
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
