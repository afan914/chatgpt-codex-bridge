console.log("ChatGPT Context Bridge content script loaded");

chrome.runtime.onMessage.addListener((message: unknown, _sender, sendResponse) => {
  if (isRecord(message) && message.type === "CHATGPT_CODEX_BRIDGE_PING") {
    sendResponse({ ok: true });
    return false;
  }

  return false;
});

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
