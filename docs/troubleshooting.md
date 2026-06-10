# Troubleshooting

## Local Service Disconnected

If you only want to export a package, you can still use the extension without starting the Bridge. Choose `Export as package`; the browser will download the zip.

Start the Bridge manually:

```bash
chatgpt-codex-bridge start
```

Or enable auto-start:

```bash
chatgpt-codex-bridge install-service
```

Check status:

```bash
chatgpt-codex-bridge status
```

Then test:

```bash
curl http://127.0.0.1:17321/health
```

## Local service is not running, but I only want to export a package

You can still export the current conversation as a package from the extension.

Choose:

```text
Export as package
```

The package will be downloaded by the browser.

To import directly into a Codex project, start the local service:

```bash
chatgpt-codex-bridge start
```

Or enable auto-start:

```bash
chatgpt-codex-bridge install-service
```

## Browser package export did not download

Possible causes:

1. Browser blocked the download.
2. Extension does not have downloads permission.
3. Zip generation failed.
4. The conversation was not read successfully.
5. Background service worker did not respond.

Fix:

1. Check browser download bar/history.
2. Reload the extension.
3. Refresh the ChatGPT page.
4. Retry export.
5. Inspect extension service worker logs.

## Export package is very large

Some conversations may contain large data URLs or generated assets.

The extension may skip large data URL images and record them in `assets_manifest.json` as unresolved.

## Port `17321` Already in Use

Another Bridge process may already be running. Check status, stop it, or edit:

```text
~/.chatgpt-codex-bridge/config.json
```

The extension expects `127.0.0.1:17321`.

## Auto-start Installation Failed

The service is installed as the current user, not as an admin-level system service.

Platform notes:

1. macOS uses `~/Library/LaunchAgents/com.chatgpt-codex-bridge.plist`.
2. Windows uses a user-level Task Scheduler task named `ChatGPTCodexBridge`.
3. Linux uses `~/.config/systemd/user/chatgpt-codex-bridge.service` when systemd user mode is available.

Run:

```bash
chatgpt-codex-bridge status
```

Then check logs under:

```text
~/.chatgpt-codex-bridge/logs/
```

## Service Installed but Extension Still Disconnected

1. Run `chatgpt-codex-bridge status`.
2. Test `curl http://127.0.0.1:17321/health`.
3. Confirm the extension is configured for `127.0.0.1:17321`.
4. Check `~/.chatgpt-codex-bridge/logs/bridge.err.log`.

## Stale PID File

The PID file is:

```text
~/.chatgpt-codex-bridge/bridge.pid
```

`chatgpt-codex-bridge start` removes stale PID files when the process is dead. If a live process is listed but health checks fail, inspect logs before starting another Bridge.

## Log Files Are Too Large

Logs rotate automatically at 10 MB and keep three rotated files:

```text
bridge.log
bridge.log.1
bridge.log.2
bridge.log.3
```

## Uninstall Auto-start

```bash
chatgpt-codex-bridge uninstall-service
```

Config, exports, and project registry files are left intact.

## macOS launchctl Compatibility

Modern macOS generally uses `launchctl bootstrap` and `launchctl bootout`. Older versions may require `launchctl load` and `launchctl unload`; the CLI tries the modern command first and falls back to the legacy command.

## Windows Task Scheduler Troubleshooting

If `schtasks` fails, verify Task Scheduler is available for the current user. The CLI does not use the Startup folder as the primary auto-start mechanism.

## Linux systemd User Service Troubleshooting

Linux support requires systemd user mode. If `systemctl --user` is unavailable, use manual start:

```bash
chatgpt-codex-bridge start
```

## No Codex Project Configured

This only affects `Import to Codex project`. `Export as package` does not need a configured project.

The Bridge automatically discovers common local project folders. If your project does not appear, add it manually:

```bash
chatgpt-codex-bridge project add <id> <path>
chatgpt-codex-bridge project set-default <id>
```

## Project List Is Empty in Popup

The project list is only needed for direct Codex import. Package export can still work without it.

Possible causes:

1. No project was discovered or configured.
2. Bridge is not running.
3. `/projects` endpoint failed.

Fix:

```bash
chatgpt-codex-bridge project list
```

Add a project if needed.

## Project Selection Resets Unexpectedly

The popup should wait for both the Bridge project list and stored selected project ID before choosing a fallback project.

If selection resets, reload the extension and confirm the latest version is running.

## Package Export Failed

Possible causes:

1. Browser download was blocked.
2. Zip creation failed.
3. Asset writing failed unexpectedly.

Fix:

1. Check browser downloads.
2. Reload the extension.
3. Retry export.

## Some Assets Are Unresolved

Some assets cannot be saved automatically because they are blob URLs, protected URLs, or require ChatGPT internal access.

Fix:

1. Check `assets_manifest.json`.
2. Manually download the asset from ChatGPT if needed.
3. Place it into the project if Codex needs it.

## Asset Save Failed

Possible causes:

1. Unsupported URL.
2. Invalid filename.
3. Write permission issue.
4. Unsupported MIME type.
5. Data URL decoding failed.

Fix:

1. Check `failureReason` in `assets_manifest.json`.
2. Confirm project folder is writable.
3. Retry.

## HTML or Markdown Artifact Not Saved

Possible causes:

1. Code block language was not labeled as `html`, `md`, or `markdown`.
2. The content was not inside a code block.
3. ChatGPT rendered it as an artifact not visible in the DOM.

Fix:

1. Check `full_conversation.md`.
2. Check `assets_manifest.json`.
3. If needed, copy the artifact manually.

## Current Page Is Not a ChatGPT Conversation

Open a specific conversation at `https://chatgpt.com/c/...`, wait until it loads, then reopen the popup.

## Conversation Read Failed

Refresh the ChatGPT page after reloading the extension, then reopen the popup and retry.
