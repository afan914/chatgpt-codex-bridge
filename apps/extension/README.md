# Browser Extension

## Current Milestone

Milestone 3 implements real ChatGPT conversation extraction from the current page.

The popup proves this local chain:

```text
ChatGPT DOM -> content script -> extension popup -> local Bridge -> configured Codex project .codex-context/
```

## What the Extension Does Now

- Detects ChatGPT pages.
- Requests content script extraction.
- Extracts messages, roles, text, code blocks, and links.
- Sends the real payload to the local Bridge.
- Supports English / Chinese UI.

## Build

```bash
pnpm --filter extension build
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

The folder must contain `manifest.json`, `popup.html`, and `serviceWorker.js`.
It must also contain `content.js`, which is injected into ChatGPT pages.

## Content Script Build

The content script is built separately with:

```bash
pnpm --filter extension build:content
```

The normal build command runs this automatically:

```bash
pnpm --filter extension build
```

`content.js` is emitted as a standalone IIFE bundle so Chrome can execute it as a content script without runtime imports.

## Permissions

- `activeTab`: allows interaction with the active tab after user action.
- `tabs`: reads the current tab URL and title so the popup can detect ChatGPT pages.
- `storage`: persists the selected popup language.
- Host permissions are limited to ChatGPT domains and `http://127.0.0.1:17321/*`.

The extension does not request `<all_urls>`.

## Bridge Communication

The popup calls:

```text
GET http://127.0.0.1:17321/health
POST http://127.0.0.1:17321/import-chatgpt-context
```

If Bridge is disconnected, the popup shows a translated hint and disables Send to Codex.

The popup also pings the ChatGPT content script with `chrome.tabs.sendMessage`. If the content script is unavailable, the popup shows a translated refresh-page hint and disables Send to Codex.

## Verify Content Script

1. Confirm `dist/content.js` exists.
2. Confirm `dist/manifest.json` references `content.js`.
3. Open ChatGPT DevTools and look for:

```text
ChatGPT Context Bridge content script loaded
```

## i18n

The popup imports `t(locale, key)` and `Locale` from `@chatgpt-codex-bridge/shared`.

The selected locale is stored in `chrome.storage.local` under:

```text
chatgptCodexBridge.locale
```

## Current Limitation

- Full asset downloading is not implemented yet.
- DOM extraction may require updates if ChatGPT changes page structure.
- Refresh the ChatGPT page after reloading the extension.
