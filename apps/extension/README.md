# Browser Extension

This extension currently supports Google Chrome or Chromium-based browsers that can load unpacked Manifest V3 extensions. ChatGPT Atlas cannot install or run this extension.

The extension popup reads the current ChatGPT conversation tab, shows a local status summary, imports into Codex through the local Bridge, and exports zip packages directly from the browser.

## What It Does

- Detects the active ChatGPT conversation page.
- Extracts visible messages, roles, text, code blocks, and links.
- Detects asset references such as images, downloadable links, HTML code blocks, and Markdown code blocks.
- Shows an asset summary in the popup.
- Lets the user choose a destination:
  - Import to Codex project, which requires the local Bridge and a detected or configured project.
  - Export as package, which uses browser-side JSZip generation and browser download.
- Supports English / Chinese UI.

## Build

```bash
pnpm build:extension
```

The build output is:

```text
apps/extension/dist/
```

## Load Unpacked

Open `chrome://extensions` in Google Chrome or a Chromium-based browser, enable Developer mode, click Load unpacked, and select:

```text
apps/extension/dist
```

The folder must contain `manifest.json`, `popup.html`, `serviceWorker.js`, and `content.js`.

## Local Service Calls

The popup calls:

```text
GET http://127.0.0.1:17321/health
GET http://127.0.0.1:17321/projects
POST http://127.0.0.1:17321/import-chatgpt-context
```

These calls are required for Codex project import. Package export does not require the local service.

When the local service is disconnected, the popup shows normal CLI guidance:

```text
Local service is not running.
chatgpt-codex-bridge start
chatgpt-codex-bridge install-service
```

It should not ask normal users to run `pnpm dev:bridge`.

## Package Export

The popup sends `EXPORT_CONTEXT_PACKAGE` to the background service worker. The service worker builds the zip with bundled `jszip` and calls `chrome.downloads.download`.

The `downloads` permission is used only to save the generated context package zip. No CDN scripts are loaded.

## i18n

The popup imports `t(locale, key)` and `Locale` from `@chatgpt-codex-bridge/shared`.

The selected locale is stored in `chrome.storage.local` under:

```text
chatgptCodexBridge.locale
```

The selected Codex project is stored under:

```text
chatgptCodexBridge.selectedProjectId
```

## Known Limitations

- DOM extraction may require updates if ChatGPT changes page structure.
- Refresh the ChatGPT page after reloading the extension.
- Some assets may be unresolved because blob URLs, protected URLs, and private ChatGPT backend resources cannot be saved by the Bridge.
- Large data URL images may be skipped during browser-side package export and recorded as unresolved.
- Unresolved and failed assets are still recorded in `assets_manifest.json`.
