import type { AssetReference } from "../types/asset.js";
import type { ImportChatGPTContextPayload, ImportDestination } from "../types/payload.js";

export function generateManifestJson(
  payload: ImportChatGPTContextPayload,
  assets: AssetReference[],
  destination: ImportDestination
): unknown {
  return {
    source: "chatgpt",
    title: payload.conversation.title,
    url: payload.conversation.url,
    exportedAt: payload.conversation.exportedAt,
    destination,
    messageCount: payload.messages.length,
    assetCount: assets.length,
    assetStats: getAssetStats(assets)
  };
}

export function generateAssetsManifestJson(assets: AssetReference[]): unknown {
  return {
    stats: getAssetStats(assets),
    assets
  };
}

function getAssetStats(assets: AssetReference[]): { saved: number; unresolved: number; failed: number } {
  return {
    saved: assets.filter((asset) => asset.status === "saved").length,
    unresolved: assets.filter((asset) => asset.status === "unresolved").length,
    failed: assets.filter((asset) => asset.status === "failed").length
  };
}
