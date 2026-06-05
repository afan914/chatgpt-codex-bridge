import type { IncomingMessage, ServerResponse } from "node:http";

export function applyCorsHeaders(response: ServerResponse): void {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export function handleCorsPreflight(request: IncomingMessage, response: ServerResponse): boolean {
  if (request.method !== "OPTIONS") {
    return false;
  }

  applyCorsHeaders(response);
  response.writeHead(204);
  response.end();
  return true;
}
