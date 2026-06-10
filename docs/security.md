# Security

## Local-only Bridge Model

The Bridge listens only on `127.0.0.1`. It must never listen on `0.0.0.0` because it can write files into selected local project directories.

Auto-start does not introduce a remote server. The Bridge still binds only to the loopback interface.

## Project Registry Security

1. Bridge only writes to project paths selected by the user from detected or configured projects.
2. Service installation itself does not scan local Codex projects.
3. Project paths may be detected from common local project folders or configured manually by the user.
4. The extension receives the detected/configured project list from the local Bridge.

## Service Mode Security

1. Auto-start services run as the current user.
2. No admin-level system service is required for the supported service paths.
3. Config, PID, logs, and exports are stored under `~/.chatgpt-codex-bridge/`.
4. The PID file is used only for Bridge process management.
5. Platform support varies: macOS LaunchAgent support is implemented, Windows Task Scheduler support is implemented but not locally verified here, and Linux systemd user support requires `systemctl --user`.

## Logs

Logs are written to:

```text
~/.chatgpt-codex-bridge/logs/
```

Logs should include service lifecycle and import/export summaries only. They must not include full conversation content, asset content, or secrets.

## Package Export Security

1. Browser-side package export is generated locally inside the extension.
2. Browser-side package export does not upload data.
3. Packages may contain private conversation content.
4. Users should review packages before sharing.
5. Browser-side export cannot write directly into arbitrary project folders.
6. Codex project import still requires the local Bridge because it writes to local project paths.
7. JSZip is bundled as an npm dependency and is not loaded from a CDN.
8. Large data URL images may be skipped to reduce memory and file size risk.

## Asset Security

1. Assets may contain private or sensitive content.
2. Saved assets are written locally into the selected detected/configured project directory or exported package.
3. Nothing is uploaded to remote services.
4. Users should review generated assets before committing to public repositories.

## URL Handling

1. The tool does not bypass browser security.
2. The tool does not call private ChatGPT APIs.
3. Protected or inaccessible URLs are recorded as unresolved or failed.
4. Asset failure reasons are standardized and do not expose secret data.

## Path Safety

1. Asset filenames are sanitized.
2. Asset files are only written inside the selected context output, such as a detected/configured Codex project folder or the browser-generated zip package.
3. Path traversal is blocked.

## Browser Extension Permissions

- `activeTab` and `tabs` read the current tab title and URL so the popup can detect ChatGPT pages.
- `storage` persists language and selected project ID.
- `downloads` is used only to save the generated context package zip.
- Host permissions are limited to ChatGPT domains and the local Bridge address.

The extension does not request `<all_urls>`.

## Private ChatGPT APIs

The project intentionally avoids private ChatGPT APIs. The extension reads visible page DOM only.
