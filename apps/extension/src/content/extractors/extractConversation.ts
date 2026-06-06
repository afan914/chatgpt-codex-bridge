import type { AssetReference, ImportChatGPTContextPayload } from "@chatgpt-codex-bridge/shared";
import { extractAssets } from "./extractAssets";
import { extractMessages } from "./extractMessages";

export type ExtractionSummary = {
  messageCount: number;
  codeBlockCount: number;
  linkCount: number;
  assetCount: number;
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

  const assets: AssetReference[] = extractedMessages.flatMap(({ element, message }) =>
    extractAssets(element, message.index)
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
      assetCount: assets.length
    }
  };
}

function getConversationTitle(): string {
  const titleCandidate =
    document.querySelector("main h1")?.textContent?.trim() ||
    document.querySelector("title")?.textContent?.trim() ||
    document.title.trim();

  return titleCandidate || "ChatGPT Conversation";
}
