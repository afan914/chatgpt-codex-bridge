import type { AssetReference } from "./asset.js";

export type MessageRole = "user" | "assistant" | "unknown";

export interface ConversationMetadata {
  title: string;
  url: string;
  exportedAt: string;
}

export interface ExtractedLink {
  text?: string;
  url: string;
}

export interface ExtractedCodeBlock {
  language?: string;
  content: string;
}

export interface ChatGPTMessage {
  index: number;
  role: MessageRole;
  content: string;
  links?: ExtractedLink[];
  codeBlocks?: ExtractedCodeBlock[];
}

export type ImportDestination =
  | { type: "codex_project"; projectId?: string }
  | { type: "package" };

export interface ImportChatGPTContextPayload {
  conversation: ConversationMetadata;
  messages: ChatGPTMessage[];
  assets?: AssetReference[];
  destination?: ImportDestination;
}
