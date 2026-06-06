import type { ConversationMetadata } from "@chatgpt-codex-bridge/shared";

export function buildCodexTaskMarkdown(conversation: ConversationMetadata): string {
  return `# Codex Task

This directory contains context exported from a ChatGPT conversation.

## Read first

1. README.md
2. full_conversation.md
3. assets_manifest.json
4. assets/

## Source

- Conversation title: ${conversation.title}
- Conversation URL: ${conversation.url}
- Exported at: ${conversation.exportedAt}

## Task

Use this context to continue implementation in this project.

Treat \`full_conversation.md\` as the source of truth for the user's intent, constraints, decisions, and requirements.

Do not ignore unresolved assets listed in \`assets_manifest.json\`. If an asset is unresolved, explain what is missing before relying on it.

## Assets workflow

- Saved snippets are in \`assets/snippets/\`.
- Saved HTML artifacts are in \`assets/html/\`.
- Saved Markdown artifacts are in \`assets/markdown/\`.
- Saved images and downloadable files are in \`assets/images/\` or \`assets/files/\` when available.
- \`assets_manifest.json\` is the source of truth for saved, unresolved, and failed assets.
`;
}
