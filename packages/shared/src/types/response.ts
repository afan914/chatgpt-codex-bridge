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

export interface ProjectListItem {
  id: string;
  name: string;
  path: string;
  isDefault: boolean;
}

export interface ProjectsResponse {
  ok: true;
  projects: ProjectListItem[];
}

export interface ImportSuccessResponse {
  ok: true;
  mode: "codex_project" | "package";
  conversationSlug: string;
  outputDir?: string;
  packagePath?: string;
  filesWritten: string[];
}

export type ImportChatGPTContextResponse = ImportSuccessResponse | ErrorResponse;
