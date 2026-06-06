import type { ExtractedLink } from "@chatgpt-codex-bridge/shared";

export function extractLinks(messageElement: Element): ExtractedLink[] {
  const seenUrls = new Set<string>();
  const links: ExtractedLink[] = [];

  for (const anchor of Array.from(messageElement.querySelectorAll<HTMLAnchorElement>("a[href]"))) {
    const url = anchor.href;
    if (!url || url.startsWith("javascript:") || seenUrls.has(url)) {
      continue;
    }

    seenUrls.add(url);
    links.push({
      url,
      text: anchor.innerText.trim() || undefined
    });
  }

  return links;
}
