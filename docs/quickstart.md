# Quickstart for Non-technical Users

## What you will set up

You will set up two local pieces:

- The browser extension reads your current ChatGPT conversation.
- The local Bridge runs on your computer.
- The Bridge writes the conversation context into your Codex project folder.
- Nothing is uploaded to a remote server by this tool.

Milestone 1 sets up the local Bridge. The browser button arrives in Milestone 2.

## Step 1: Install Node.js

Go to https://nodejs.org and install the LTS version.

After installation, open Terminal and run:

```bash
node --version
npm --version
```

Expected output:

```text
v20.x.x
10.x.x
```

The exact numbers may be different. If Terminal says `command not found`, close Terminal, open it again, and retry.

## Step 2: Install pnpm

Run:

```bash
npm install -g pnpm
```

Then verify:

```bash
pnpm --version
```

If this fails, Node.js or npm may not be installed correctly.

## Step 3: Download this project

### Option A: Download ZIP from GitHub

Open:

```text
https://github.com/afan914/chatgpt-codex-bridge
```

Click the green "Code" button, choose "Download ZIP", then unzip it. Open Terminal and move into the unzipped folder.

### Option B: Use git clone

For users who already have Git:

```bash
git clone https://github.com/afan914/chatgpt-codex-bridge.git
cd chatgpt-codex-bridge
```

## Step 4: Install project dependencies

Run:

```bash
cd chatgpt-codex-bridge
pnpm install
```

This downloads the libraries the project needs. It may take a few minutes.

## Step 5: Configure your Codex project folder

Run:

```bash
pnpm dev:bridge -- init
pnpm dev:bridge -- config set-project /path/to/your/codex/project
```

Replace `/path/to/your/codex/project` with the folder where your Codex project lives.

On Mac, you can drag a folder into Terminal to paste its full path.

Expected output should say that the default project path was set.

## Step 6: Start the Bridge

Run:

```bash
pnpm dev:bridge
```

Expected output:

```text
ChatGPT Codex Bridge running at http://127.0.0.1:17321
```

Keep this Terminal window open while using the extension.

## Step 7: Build the extension

Open a new Terminal window and run:

```bash
pnpm build:extension
```

In Milestone 1 this command is only a placeholder. In Milestone 2 it will build the browser extension.

## Step 8: Load the extension in Atlas / Chrome / Arc

This step is available after Milestone 2.

1. Open your browser.
2. Go to:

```text
chrome://extensions
```

3. Turn on "Developer mode".
4. Click "Load unpacked".
5. Select:

```text
chatgpt-codex-bridge/apps/extension/dist
```

## Step 9: Test the full flow

After Milestone 2:

1. Open a ChatGPT conversation.
2. Click the extension icon.
3. Confirm Bridge connected and ChatGPT conversation detected.
4. Click "Send to Codex".
5. Open your Codex project folder.
6. Check that this folder exists:

```text
.codex-context/chatgpt/
```

For Milestone 1, you can test the Bridge with:

```bash
curl -X POST http://127.0.0.1:17321/import-chatgpt-context \
  -H "Content-Type: application/json" \
  -d @examples/mock-payload.json
```

## Step 10: Use it in Codex App

In Codex App, ask Codex to read:

```text
.codex-context/chatgpt/<conversation-slug>/CODEX_TASK.md
```

Then continue the implementation based on that context.

## Troubleshooting

See:

```text
docs/troubleshooting.md
```
