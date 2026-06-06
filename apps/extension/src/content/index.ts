import { extractConversation } from "./extractors/extractConversation";

console.log("ChatGPT Context Bridge content script loaded");

chrome.runtime.onMessage.addListener((message: unknown, _sender, sendResponse) => {
  if (isRecord(message) && (message.type === "PING_CONTENT_SCRIPT" || message.type === "CHATGPT_CODEX_BRIDGE_PING")) {
    sendResponse({ ok: true });
    return false;
  }

  if (isRecord(message) && message.type === "EXTRACT_CHATGPT_CONVERSATION") {
    try {
      sendResponse(extractConversation());
    } catch (error) {
      sendResponse({
        ok: false,
        error: {
          code: "EXTRACTION_FAILED",
          message: error instanceof Error ? error.message : "Failed to extract conversation"
        }
      });
    }
    return true;
  }

  return false;
});

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
