import path from "node:path";
import { assertPathInside } from "../security/pathSafety.js";
import { recreateDirectory } from "../utils/fileSystem.js";

export async function overwriteExportDirectory(projectPath: string, conversationSlug: string): Promise<string> {
  const outputDir = path.join(projectPath, ".codex-context", "chatgpt", conversationSlug);
  assertPathInside(projectPath, outputDir);
  await recreateDirectory(outputDir);
  return outputDir;
}
