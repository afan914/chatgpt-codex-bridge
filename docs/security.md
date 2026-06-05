# Security

## Local-only Bridge Model

The Bridge listens only on `127.0.0.1`. It must never listen on `0.0.0.0` because it can write files into the configured project directory.

## No Remote Upload

The Bridge writes files locally and does not upload ChatGPT content to remote services.

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
