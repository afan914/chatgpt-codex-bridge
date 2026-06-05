export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ErrorResponse {
  ok: false;
  error: ApiError;
}

export interface HealthResponse {
  ok: true;
  service: "chatgpt-codex-bridge";
  version: string;
}

export interface ImportSuccessResponse {
  ok: true;
  conversationSlug: string;
  outputDir: string;
  filesWritten: string[];
}

export type ImportChatGPTContextResponse = ImportSuccessResponse | ErrorResponse;
