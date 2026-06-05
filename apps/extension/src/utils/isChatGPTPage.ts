export function isChatGPTPage(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.hostname === "chatgpt.com" || parsedUrl.hostname === "chat.openai.com";
  } catch {
    return false;
  }
}
