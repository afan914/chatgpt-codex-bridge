import type { ExtractedCodeBlock } from "@chatgpt-codex-bridge/shared";

export function extractCodeBlocks(messageElement: Element): ExtractedCodeBlock[] {
  return Array.from(messageElement.querySelectorAll("pre code"))
    .map((codeElement) => {
      const content = codeElement.textContent ?? "";
      return {
        language: inferLanguage(codeElement),
        content
      };
    })
    .filter((block) => block.content.trim().length > 0);
}

function inferLanguage(codeElement: Element): string {
  for (const className of Array.from(codeElement.classList)) {
    if (className.startsWith("language-")) {
      return className.replace(/^language-/, "") || "text";
    }
  }

  const pre = codeElement.closest("pre");
  const label = pre?.parentElement?.querySelector("[data-language], .text-token-text-secondary")?.textContent?.trim();
  if (label && /^[a-z0-9+#.-]{1,24}$/i.test(label)) {
    return label;
  }

  return "text";
}
