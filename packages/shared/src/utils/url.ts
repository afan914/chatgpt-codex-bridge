export function isValidUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export function isChatGPTConversationUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      (url.hostname === "chatgpt.com" || url.hostname === "chat.openai.com") &&
      url.pathname.startsWith("/c/")
    );
  } catch {
    return false;
  }
}

export function extractConversationId(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.hostname !== "chatgpt.com" && url.hostname !== "chat.openai.com") {
      return null;
    }

    const [, route, id] = url.pathname.split("/");
    return route === "c" && id ? id : null;
  } catch {
    return null;
  }
}
