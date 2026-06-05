export type AssetType = "image" | "html" | "markdown" | "file" | "link" | "unknown";

export type AssetStatus = "saved" | "unresolved" | "failed";

export interface AssetReference {
  id: string;
  type: AssetType;
  status: AssetStatus;
  sourceUrl?: string;
  sourceMessageIndex?: number;
  filename?: string | null;
  failureReason?: string;
}
