export function isChatGPTPage(url: string): boolean {
  const normalizedUrl = normalizeUrl(url);

  try {
    const parsedUrl = new URL(normalizedUrl);
    const hostname = parsedUrl.hostname.toLowerCase();
    return isChatGPTHostname(hostname);
  } catch {
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.startsWith("chatgpt.com") || lowerUrl.startsWith("chat.openai.com")) {
      return true;
    }
    return false;
  }
}

function normalizeUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  if (url.startsWith("chatgpt.com") || url.startsWith("chat.openai.com")) {
    return `https://${url}`;
  }

  return url;
}

function isChatGPTHostname(hostname: string): boolean {
  return (
    hostname === "chatgpt.com" ||
    hostname.endsWith(".chatgpt.com") ||
    hostname === "chat.openai.com" ||
    hostname.endsWith(".chat.openai.com")
  );
}
