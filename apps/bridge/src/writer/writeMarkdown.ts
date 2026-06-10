import path from "node:path";
import {
  generateCodexTaskMarkdown,
  generateExportReadmeMarkdown,
  generateFullConversationMarkdown,
  type ImportChatGPTContextPayload
} from "@chatgpt-codex-bridge/shared";
import { writeTextFile } from "../utils/fileSystem.js";

export async function writeMarkdownFiles(outputDir: string, payload: ImportChatGPTContextPayload): Promise<string[]> {
  await writeTextFile(path.join(outputDir, "CODEX_TASK.md"), generateCodexTaskMarkdown(payload.conversation));
  await writeTextFile(path.join(outputDir, "README.md"), generateExportReadmeMarkdown());
  await writeTextFile(path.join(outputDir, "full_conversation.md"), generateFullConversationMarkdown(payload.messages));
  return ["CODEX_TASK.md", "README.md", "full_conversation.md"];
}
