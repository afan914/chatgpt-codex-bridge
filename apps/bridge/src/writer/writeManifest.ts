import path from "node:path";
import type { ImportChatGPTContextPayload } from "@chatgpt-codex-bridge/shared";
import { writeJsonFile } from "../utils/fileSystem.js";

export async function writeManifestFiles(outputDir: string, payload: ImportChatGPTContextPayload): Promise<string[]> {
  const assets = payload.assets ?? [];

  await writeJsonFile(path.join(outputDir, "manifest.json"), {
    source: "chatgpt",
    title: payload.conversation.title,
    url: payload.conversation.url,
    exportedAt: payload.conversation.exportedAt,
    messageCount: payload.messages.length,
    assetCount: assets.length
  });

  await writeJsonFile(path.join(outputDir, "assets_manifest.json"), {
    assets
  });

  return ["manifest.json", "assets_manifest.json"];
}
