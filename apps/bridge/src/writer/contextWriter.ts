import os from "node:os";
import path from "node:path";
import {
  createConversationSlug,
  type ImportChatGPTContextPayload,
  type ImportDestination
} from "@chatgpt-codex-bridge/shared";
import { validateProjectPath } from "../security/projectPath.js";
import { ensureDirectory, recreateDirectory } from "../utils/fileSystem.js";
import { createZipFromDirectory } from "./createZip.js";
import { writeAssetFiles } from "./writeAssets.js";
import { overwriteExportDirectory } from "./overwriteExportDir.js";
import { writeManifestFiles } from "./writeManifest.js";
import { writeMarkdownFiles } from "./writeMarkdown.js";

export interface ContextExportResult {
  mode: "codex_project" | "package";
  conversationSlug: string;
  outputDir?: string;
  packagePath?: string;
  filesWritten: string[];
}

export async function importToCodexProject(
  projectPath: string,
  payload: ImportChatGPTContextPayload
): Promise<ContextExportResult> {
  const destination = resolveDestination(payload.destination);
  const resolvedProjectPath = await validateProjectPath(projectPath);
  const conversationSlug = createConversationSlug(payload.conversation.title, payload.conversation.url);
  const outputDir = await overwriteExportDirectory(resolvedProjectPath, conversationSlug);
  const filesWritten = await writeContextExport(payload, outputDir, destination);

  return {
    mode: "codex_project",
    conversationSlug,
    outputDir,
    filesWritten
  };
}

export async function exportAsPackage(payload: ImportChatGPTContextPayload): Promise<ContextExportResult> {
  const destination: ImportDestination = { type: "package" };
  const conversationSlug = createConversationSlug(payload.conversation.title, payload.conversation.url);
  const packageFolderName = `chatgpt-context-package-${conversationSlug}`;
  const exportsDir = getExportsDirectory();
  const stagingDir = path.join(exportsDir, ".staging", packageFolderName);
  const packagePath = path.join(exportsDir, `${packageFolderName}.zip`);

  await ensureDirectory(exportsDir);
  await recreateDirectory(stagingDir);

  const filesWritten = await writeContextExport(payload, stagingDir, destination);
  await createZipFromDirectory(stagingDir, packagePath, packageFolderName);
  filesWritten.push(path.basename(packagePath));

  return {
    mode: "package",
    conversationSlug,
    packagePath,
    filesWritten
  };
}

export async function writeContextExport(
  payload: ImportChatGPTContextPayload,
  outputDir: string,
  destination: ImportDestination = { type: "codex_project" }
): Promise<string[]> {
  const assetResult = await writeAssetFiles(outputDir, payload);
  return [
    ...(await writeMarkdownFiles(outputDir, payload)),
    ...assetResult.filesWritten,
    ...(await writeManifestFiles(outputDir, payload, assetResult.assets, destination))
  ];
}

function resolveDestination(destination: ImportDestination | undefined): ImportDestination {
  return destination ?? { type: "codex_project" };
}

function getExportsDirectory(): string {
  return path.join(os.homedir(), ".chatgpt-codex-bridge", "exports");
}
