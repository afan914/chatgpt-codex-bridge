# Browser Extension

The extension popup reads the current ChatGPT conversation tab, shows a local status summary, and sends the extracted context to the local Bridge.

## What It Does

- Detects the active ChatGPT conversation page.
- Extracts visible messages, roles, text, code blocks, and links.
- Detects asset references such as images, downloadable links, HTML code blocks, and Markdown code blocks.
- Shows an asset summary in the popup.
- Lets the user choose a destination:
  - Import to Codex project
  - Export as package
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

Open `chrome://extensions`, enable Developer mode, click Load unpacked, and select:

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
- Unresolved and failed assets are still recorded in `assets_manifest.json`.
