# Security

## Local-only Bridge Model

The Bridge listens only on `127.0.0.1`. It must never listen on `0.0.0.0` because it can write files into configured project directories.

## Project Registry Security

1. Bridge only writes to explicitly configured project paths.
2. Bridge does not scan the filesystem.
3. Project paths are configured by the user.
4. The extension only receives the configured project list from the local Bridge.

## Package Export Security

1. Packages are written locally under the Bridge export directory.
2. Implementation uses `os.homedir()` and `path.join()` to resolve the export directory.
3. Packages may contain private conversation content.
4. Users should review packages before sharing.

## Asset Security

1. Assets may contain private or sensitive content.
2. Saved assets are written locally into the configured project directory or exported package.
3. Nothing is uploaded to remote services.
4. Users should review generated assets before committing to public repositories.

## URL Handling

1. The tool does not bypass browser security.
2. The tool does not call private ChatGPT APIs.
3. Protected or inaccessible URLs are recorded as unresolved or failed.
4. Asset failure reasons are standardized and do not expose secret data.

## Path Safety

1. Asset filenames are sanitized.
2. Asset files are only written inside the export directory.
3. Path traversal is blocked.

## Browser Extension Permissions

- `activeTab` and `tabs` read the current tab title and URL so the popup can detect ChatGPT pages.
- `storage` persists language and selected project ID.
- Host permissions are limited to ChatGPT domains and the local Bridge address.

The extension does not request `<all_urls>`.

## Private ChatGPT APIs

The project intentionally avoids private ChatGPT APIs. The extension reads visible page DOM only.
