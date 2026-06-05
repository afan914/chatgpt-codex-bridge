import { createConversationSlug, type ImportChatGPTContextPayload } from "@chatgpt-codex-bridge/shared";
import { validateProjectPath } from "../security/projectPath.js";
import { writeAssetFiles } from "./writeAssets.js";
import { overwriteExportDirectory } from "./overwriteExportDir.js";
import { writeManifestFiles } from "./writeManifest.js";
import { writeMarkdownFiles } from "./writeMarkdown.js";

export interface ContextExportResult {
  conversationSlug: string;
  outputDir: string;
  filesWritten: string[];
}

export async function writeContextExport(
  projectPath: string | undefined,
  payload: ImportChatGPTContextPayload
): Promise<ContextExportResult> {
  const resolvedProjectPath = await validateProjectPath(projectPath);
  const conversationSlug = createConversationSlug(payload.conversation.title, payload.conversation.url);
  const outputDir = await overwriteExportDirectory(resolvedProjectPath, conversationSlug);

  const filesWritten = [
    ...(await writeMarkdownFiles(outputDir, payload)),
    ...(await writeManifestFiles(outputDir, payload)),
    ...(await writeAssetFiles(outputDir, payload.messages))
  ];

  return {
    conversationSlug,
    outputDir,
    filesWritten
  };
}
