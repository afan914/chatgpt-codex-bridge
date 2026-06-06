import path from "node:path";
import type { AssetReference, ImportChatGPTContextPayload, ImportDestination } from "@chatgpt-codex-bridge/shared";
import { writeJsonFile } from "../utils/fileSystem.js";

export async function writeManifestFiles(
  outputDir: string,
  payload: ImportChatGPTContextPayload,
  assets: AssetReference[],
  destination: ImportDestination
): Promise<string[]> {
  const assetStats = {
    saved: assets.filter((asset) => asset.status === "saved").length,
    unresolved: assets.filter((asset) => asset.status === "unresolved").length,
    failed: assets.filter((asset) => asset.status === "failed").length
  };

  await writeJsonFile(path.join(outputDir, "manifest.json"), {
    source: "chatgpt",
    title: payload.conversation.title,
    url: payload.conversation.url,
    exportedAt: payload.conversation.exportedAt,
    destination,
    messageCount: payload.messages.length,
    assetCount: assets.length,
    assetStats
  });

  await writeJsonFile(path.join(outputDir, "assets_manifest.json"), {
    stats: assetStats,
    assets
  });

  return ["manifest.json", "assets_manifest.json"];
}
