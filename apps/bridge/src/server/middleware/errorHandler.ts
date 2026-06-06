import type { ServerResponse } from "node:http";
import type { ErrorResponse } from "@chatgpt-codex-bridge/shared";

export function sendJson(response: ServerResponse, statusCode: number, body: unknown): void {
  response.writeHead(statusCode, { "Content-Type": "application/json" });
  response.end(`${JSON.stringify(body, null, 2)}\n`);
}

export function sendApiError(response: ServerResponse, statusCode: number, code: string, message: string): void {
  const body: ErrorResponse = {
    ok: false,
    error: {
      code,
      message
    }
  };
  sendJson(response, statusCode, body);
}

export function errorToApiError(error: unknown): { statusCode: number; code: string; message: string } {
  const message = error instanceof Error ? error.message : "WRITE_FAILED";

  if (message === "PROJECT_PATH_NOT_CONFIGURED" || message === "NO_PROJECT_CONFIGURED") {
    return {
      statusCode: 400,
      code: "NO_PROJECT_CONFIGURED",
      message: "No Codex project configured. Run: chatgpt-codex-bridge project add <id> <path>"
    };
  }

  if (message === "PROJECT_NOT_FOUND") {
    return {
      statusCode: 400,
      code: message,
      message: "Requested Codex project was not found"
    };
  }

  if (message === "PROJECT_PATH_NOT_FOUND") {
    return {
      statusCode: 400,
      code: message,
      message: "Configured project path does not exist or is not a directory"
    };
  }

  if (message === "PATH_TRAVERSAL_DETECTED") {
    return {
      statusCode: 400,
      code: message,
      message: "Path traversal detected"
    };
  }

  return {
    statusCode: 500,
    code: "WRITE_FAILED",
    message: "Failed to write ChatGPT context export"
  };
}
