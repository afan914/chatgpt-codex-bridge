export const ASSET_FAILURE_REASONS = {
  BLOB_URL_BROWSER_ONLY: "Blob URL cannot be saved by the Bridge because it is only valid in the browser page context",
  CROSS_ORIGIN_OR_PROTECTED: "Asset URL could not be saved automatically because it may be protected or inaccessible",
  UNSUPPORTED_URL: "Unsupported asset URL",
  UNSUPPORTED_DATA_URL: "Unsupported data URL asset type",
  DATA_URL_DECODE_FAILED: "Data URL decoding failed",
  WRITE_FAILED: "Asset write failed"
} as const;
