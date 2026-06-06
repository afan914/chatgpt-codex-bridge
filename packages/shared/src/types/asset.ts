export type AssetType = "image" | "html" | "markdown" | "file" | "link" | "code" | "unknown";

export type AssetStatus = "saved" | "unresolved" | "failed";

export interface AssetReference {
  id: string;
  type: AssetType;
  status: AssetStatus;
  sourceUrl?: string;
  sourceLabel?: string;
  sourceMessageIndex?: number;
  filename?: string | null;
  failureReason?: string;
  mimeType?: string;
  sizeBytes?: number;
  content?: string;
}
