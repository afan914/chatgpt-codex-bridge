import type {
  ChatGPTMessage,
  ExtractedCodeBlock,
  ExtractedLink,
  ImportChatGPTContextPayload,
  ImportDestination,
  MessageRole
} from "../types/payload.js";
import type { AssetReference, AssetStatus, AssetType } from "../types/asset.js";
import { isValidUrl } from "../utils/url.js";

export interface ValidationError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: ValidationError };

const messageRoles: MessageRole[] = ["user", "assistant", "unknown"];
const assetTypes: AssetType[] = ["image", "html", "markdown", "file", "link", "code", "unknown"];
const assetStatuses: AssetStatus[] = ["saved", "unresolved", "failed"];

export function validateImportPayload(input: unknown): ValidationResult<ImportChatGPTContextPayload> {
  if (!isRecord(input)) {
    return invalid("INVALID_PAYLOAD", "payload must be an object");
  }

  const conversationResult = validateConversation(input.conversation);
  if (!conversationResult.ok) {
    return conversationResult;
  }

  const messagesResult = validateMessages(input.messages);
  if (!messagesResult.ok) {
    return messagesResult;
  }

  const assetsResult = validateAssets(input.assets);
  if (!assetsResult.ok) {
    return assetsResult;
  }

  const destinationResult = validateDestination(input.destination);
  if (!destinationResult.ok) {
    return destinationResult;
  }

  return {
    ok: true,
    value: {
      conversation: conversationResult.value,
      messages: messagesResult.value,
      assets: assetsResult.value,
      destination: destinationResult.value
    }
  };
}

function validateConversation(input: unknown): ValidationResult<ImportChatGPTContextPayload["conversation"]> {
  if (!isRecord(input)) {
    return invalid("INVALID_PAYLOAD", "conversation must be an object");
  }

  if (!isNonEmptyString(input.title)) {
    return invalid("INVALID_PAYLOAD", "conversation.title must be a non-empty string");
  }

  if (!isNonEmptyString(input.url) || !isValidUrl(input.url)) {
    return invalid("INVALID_CONVERSATION_URL", "conversation.url must be a valid URL string");
  }

  if (!isNonEmptyString(input.exportedAt) || Number.isNaN(Date.parse(input.exportedAt))) {
    return invalid("INVALID_PAYLOAD", "conversation.exportedAt must be a valid ISO datetime string");
  }

  return {
    ok: true,
    value: {
      title: input.title,
      url: input.url,
      exportedAt: input.exportedAt
    }
  };
}

function validateMessages(input: unknown): ValidationResult<ChatGPTMessage[]> {
  if (!Array.isArray(input)) {
    return invalid("INVALID_PAYLOAD", "messages must be an array");
  }

  if (input.length === 0) {
    return invalid("EMPTY_MESSAGES", "messages must be a non-empty array");
  }

  const messages: ChatGPTMessage[] = [];
  for (const item of input) {
    if (!isRecord(item)) {
      return invalid("INVALID_PAYLOAD", "each message must be an object");
    }

    if (typeof item.index !== "number" || !Number.isFinite(item.index)) {
      return invalid("INVALID_PAYLOAD", "message.index must be a number");
    }

    if (typeof item.role !== "string" || !messageRoles.includes(item.role as MessageRole)) {
      return invalid("INVALID_PAYLOAD", "message.role must be user, assistant, or unknown");
    }

    if (typeof item.content !== "string") {
      return invalid("INVALID_PAYLOAD", "message.content must be a string");
    }

    const linksResult = validateLinks(item.links);
    if (!linksResult.ok) {
      return linksResult;
    }

    const codeBlocksResult = validateCodeBlocks(item.codeBlocks);
    if (!codeBlocksResult.ok) {
      return codeBlocksResult;
    }

    messages.push({
      index: item.index,
      role: item.role as MessageRole,
      content: item.content,
      links: linksResult.value,
      codeBlocks: codeBlocksResult.value
    });
  }

  return { ok: true, value: messages };
}

function validateLinks(input: unknown): ValidationResult<ExtractedLink[]> {
  if (input === undefined) {
    return { ok: true, value: [] };
  }

  if (!Array.isArray(input)) {
    return invalid("INVALID_PAYLOAD", "message.links must be an array when present");
  }

  const links: ExtractedLink[] = [];
  for (const item of input) {
    if (!isRecord(item) || !isNonEmptyString(item.url)) {
      return invalid("INVALID_PAYLOAD", "each link must include a url string");
    }
    links.push({
      url: item.url,
      text: typeof item.text === "string" ? item.text : undefined
    });
  }

  return { ok: true, value: links };
}

function validateCodeBlocks(input: unknown): ValidationResult<ExtractedCodeBlock[]> {
  if (input === undefined) {
    return { ok: true, value: [] };
  }

  if (!Array.isArray(input)) {
    return invalid("INVALID_PAYLOAD", "message.codeBlocks must be an array when present");
  }

  const codeBlocks: ExtractedCodeBlock[] = [];
  for (const item of input) {
    if (!isRecord(item) || typeof item.content !== "string") {
      return invalid("INVALID_PAYLOAD", "each code block must include content as a string");
    }
    codeBlocks.push({
      content: item.content,
      language: typeof item.language === "string" ? item.language : undefined
    });
  }

  return { ok: true, value: codeBlocks };
}

function validateAssets(input: unknown): ValidationResult<AssetReference[]> {
  if (input === undefined) {
    return { ok: true, value: [] };
  }

  if (!Array.isArray(input)) {
    return invalid("INVALID_PAYLOAD", "assets must be an array when present");
  }

  const assets: AssetReference[] = [];
  for (const item of input) {
    if (!isRecord(item) || !isNonEmptyString(item.id)) {
      return invalid("INVALID_PAYLOAD", "each asset must include an id string");
    }

    if (typeof item.type !== "string" || !assetTypes.includes(item.type as AssetType)) {
      return invalid("INVALID_PAYLOAD", "asset.type is invalid");
    }

    if (typeof item.status !== "string" || !assetStatuses.includes(item.status as AssetStatus)) {
      return invalid("INVALID_PAYLOAD", "asset.status is invalid");
    }

    assets.push({
      id: item.id,
      type: item.type as AssetType,
      status: item.status as AssetStatus,
      sourceUrl: typeof item.sourceUrl === "string" ? item.sourceUrl : undefined,
      sourceLabel: typeof item.sourceLabel === "string" ? item.sourceLabel : undefined,
      sourceMessageIndex: typeof item.sourceMessageIndex === "number" ? item.sourceMessageIndex : undefined,
      filename: typeof item.filename === "string" || item.filename === null ? item.filename : undefined,
      failureReason: typeof item.failureReason === "string" ? item.failureReason : undefined,
      mimeType: typeof item.mimeType === "string" ? item.mimeType : undefined,
      sizeBytes: typeof item.sizeBytes === "number" ? item.sizeBytes : undefined,
      content: typeof item.content === "string" ? item.content : undefined
    });
  }

  return { ok: true, value: assets };
}

function validateDestination(input: unknown): ValidationResult<ImportDestination | undefined> {
  if (input === undefined) {
    return { ok: true, value: undefined };
  }

  if (!isRecord(input) || typeof input.type !== "string") {
    return invalid("INVALID_PAYLOAD", "destination must include a type when present");
  }

  if (input.type === "package") {
    return { ok: true, value: { type: "package" } };
  }

  if (input.type === "codex_project") {
    return {
      ok: true,
      value: {
        type: "codex_project",
        projectId: typeof input.projectId === "string" && input.projectId.trim().length > 0 ? input.projectId : undefined
      }
    };
  }

  return invalid("INVALID_PAYLOAD", "destination.type must be codex_project or package");
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === "object" && input !== null && !Array.isArray(input);
}

function isNonEmptyString(input: unknown): input is string {
  return typeof input === "string" && input.trim().length > 0;
}

function invalid(code: string, message: string): ValidationResult<never> {
  return { ok: false, error: { code, message } };
}
