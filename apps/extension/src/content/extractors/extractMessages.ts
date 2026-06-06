import type { ChatGPTMessage } from "@chatgpt-codex-bridge/shared";
import { detectMessageRole } from "../dom/roleDetection";
import { MESSAGE_CONTAINER_SELECTORS, UI_TEXT_TO_REMOVE } from "../dom/selectors";
import { extractCodeBlocks } from "./extractCodeBlocks";
import { extractLinks } from "./extractLinks";

export type ExtractedMessageWithElement = {
  message: ChatGPTMessage;
  element: Element;
};

export function extractMessages(): ExtractedMessageWithElement[] {
  const elements = collectMessageElements();
  const messages: ExtractedMessageWithElement[] = [];

  for (const element of elements) {
    const content = extractReadableText(element);
    const codeBlocks = extractCodeBlocks(element);
    if (!content && codeBlocks.length === 0) {
      continue;
    }

    messages.push({
      element,
      message: {
        index: messages.length + 1,
        role: detectMessageRole(element),
        content,
        links: extractLinks(element),
        codeBlocks
      }
    });
  }

  return messages;
}

function collectMessageElements(): Element[] {
  const seen = new Set<Element>();
  const elements: Element[] = [];

  for (const selector of MESSAGE_CONTAINER_SELECTORS) {
    for (const element of Array.from(document.querySelectorAll(selector))) {
      const messageElement = normalizeMessageElement(element);
      if (!messageElement || seen.has(messageElement)) {
        continue;
      }

      seen.add(messageElement);
      elements.push(messageElement);
    }
  }

  return elements.sort((a, b) => {
    const position = a.compareDocumentPosition(b);
    return position & Node.DOCUMENT_POSITION_PRECEDING ? 1 : -1;
  });
}

function normalizeMessageElement(element: Element): Element | null {
  const roleContainer = element.matches("[data-message-author-role]")
    ? element
    : element.querySelector("[data-message-author-role]");
  return roleContainer ?? element;
}

function extractReadableText(element: Element): string {
  const clone = element.cloneNode(true) as HTMLElement;
  for (const removable of Array.from(clone.querySelectorAll("button, svg, style, script, noscript"))) {
    removable.remove();
  }

  const text = clone.innerText || clone.textContent || "";
  return text
    .split("\n")
    .map((line) => line.trimEnd())
    .filter((line) => !UI_TEXT_TO_REMOVE.has(line.trim()))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
