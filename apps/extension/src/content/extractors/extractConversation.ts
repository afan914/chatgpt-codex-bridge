import type { AssetReference, ImportChatGPTContextPayload } from "@chatgpt-codex-bridge/shared";
import { extractAssets } from "./extractAssets";
import { extractMessages } from "./extractMessages";

export type ExtractionSummary = {
  messageCount: number;
  codeBlockCount: number;
  linkCount: number;
  assetCount: number;
  savedAssetCount: number;
  unresolvedAssetCount: number;
  failedAssetCount: number;
};

export type ExtractConversationResponse =
  | {
      ok: true;
      payload: ImportChatGPTContextPayload;
      summary: ExtractionSummary;
    }
  | {
      ok: false;
      error: {
        code: string;
        message: string;
      };
    };

export function extractConversation(): ExtractConversationResponse {
  const extractedMessages = extractMessages();
  if (extractedMessages.length === 0) {
    return {
      ok: false,
      error: {
        code: "NO_MESSAGES_DETECTED",
        message: "No ChatGPT messages were detected on the current page"
      }
    };
  }

  const assets = normalizeAssetIds(
    extractedMessages.flatMap(({ element, message }) => extractAssets(element, message.index, message.codeBlocks ?? []))
  );
  const messages = extractedMessages.map(({ message }) => message);
  const payload: ImportChatGPTContextPayload = {
    conversation: {
      title: getConversationTitle(),
      url: window.location.href,
      exportedAt: new Date().toISOString()
    },
    messages,
    assets
  };

  return {
    ok: true,
    payload,
    summary: {
      messageCount: messages.length,
      codeBlockCount: messages.reduce((count, message) => count + (message.codeBlocks?.length ?? 0), 0),
      linkCount: messages.reduce((count, message) => count + (message.links?.length ?? 0), 0),
      assetCount: assets.length,
      savedAssetCount: assets.filter((asset) => asset.status === "saved").length,
      unresolvedAssetCount: assets.filter((asset) => asset.status === "unresolved").length,
      failedAssetCount: assets.filter((asset) => asset.status === "failed").length
    }
  };
}

function normalizeAssetIds(assets: AssetReference[]): AssetReference[] {
  return assets.map((asset, index) => ({
    ...asset,
    id: asset.id || `asset-${String(index + 1).padStart(3, "0")}`
  }));
}

function getConversationTitle(): string {
  const titleCandidate =
    document.querySelector("main h1")?.textContent?.trim() ||
    document.querySelector("title")?.textContent?.trim() ||
    document.title.trim();

  return titleCandidate || "ChatGPT Conversation";
}
