# Security

## Local-only Bridge Model

The Bridge listens only on `127.0.0.1`. It must never listen on `0.0.0.0` because it can write files into the configured project directory.

## No Remote Upload

The Bridge writes files locally and does not upload ChatGPT content to remote services. Milestone 2 only sends a mock payload from the extension to the local Bridge. Future real conversation extraction must keep the same local-only model.

## Browser Extension Permissions

The extension uses narrow Manifest V3 permissions:

- `activeTab` and `tabs` read the current tab title and URL so the popup can detect ChatGPT pages.
- `storage` persists the selected language.
- Host permissions are limited to ChatGPT domains and the local Bridge address.

The extension does not request `<all_urls>`.

## Path Traversal Prevention

The writer constructs output paths from a sanitized conversation slug and verifies that the final path stays inside the configured project directory.

## Project Directory Restrictions

The user must explicitly configure a project directory:

```bash
pnpm dev:bridge -- config set-project /path/to/project
```

Imports are rejected when no project path is configured or when the configured path does not exist.

## Sensitive Data Considerations

ChatGPT conversations can contain private product plans, code, credentials, or personal data. Treat generated `.codex-context/` folders as sensitive project files.

Do not commit generated context exports unless you have reviewed them.

## Private ChatGPT APIs

The project intentionally avoids private ChatGPT APIs. The extension will extract from the current page DOM in Milestone 3.

## i18n Storage

The extension stores only the selected locale, such as `"en"` or `"zh"`, in `chrome.storage.local`. It does not store conversation content in browser storage.
