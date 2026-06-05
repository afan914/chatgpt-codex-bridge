import path from "node:path";
import type { ImportChatGPTContextPayload } from "@chatgpt-codex-bridge/shared";
import { buildCodexTaskMarkdown } from "../markdown/buildCodexTask.js";
import { buildFullConversationMarkdown } from "../markdown/buildFullConversation.js";
import { buildReadmeMarkdown } from "../markdown/buildReadme.js";
import { writeTextFile } from "../utils/fileSystem.js";

export async function writeMarkdownFiles(outputDir: string, payload: ImportChatGPTContextPayload): Promise<string[]> {
  await writeTextFile(path.join(outputDir, "CODEX_TASK.md"), buildCodexTaskMarkdown(payload.conversation));
  await writeTextFile(path.join(outputDir, "README.md"), buildReadmeMarkdown());
  await writeTextFile(path.join(outputDir, "full_conversation.md"), buildFullConversationMarkdown(payload.messages));
  return ["CODEX_TASK.md", "README.md", "full_conversation.md"];
}
