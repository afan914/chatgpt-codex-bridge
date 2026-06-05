import { createHash } from "node:crypto";
import { extractConversationId } from "./url.js";

export function sanitizeSlugTitle(title: string): string {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[\s._~:/?#\[\]@!$&'()*+,;=]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60)
    .replace(/-$/g, "");

  return slug.length > 0 ? slug : "untitled-conversation";
}

export function shortHash(input: string): string {
  return createHash("sha1").update(input).digest("hex").slice(0, 8);
}

export function createConversationSlug(title: string, url: string): string {
  const safeTitle = sanitizeSlugTitle(title);
  const conversationId = extractConversationId(url) ?? shortHash(url);
  return `${safeTitle}-${conversationId}`;
}
