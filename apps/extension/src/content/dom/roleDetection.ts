import type { MessageRole } from "@chatgpt-codex-bridge/shared";

export function detectMessageRole(element: Element): MessageRole {
  const directRole = normalizeRole(element.getAttribute("data-message-author-role"));
  if (directRole) {
    return directRole;
  }

  const nestedRole = element.querySelector("[data-message-author-role]")?.getAttribute("data-message-author-role");
  const normalizedNestedRole = normalizeRole(nestedRole);
  if (normalizedNestedRole) {
    return normalizedNestedRole;
  }

  const ariaLabel = [
    element.getAttribute("aria-label"),
    element.getAttribute("data-testid"),
    element.closest("[aria-label]")?.getAttribute("aria-label")
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (ariaLabel.includes("user")) {
    return "user";
  }

  if (ariaLabel.includes("assistant") || ariaLabel.includes("chatgpt")) {
    return "assistant";
  }

  return "unknown";
}

function normalizeRole(role: string | null | undefined): MessageRole | null {
  if (role === "user" || role === "assistant") {
    return role;
  }

  return null;
}
