import type { ServerResponse } from "node:http";
import type { HealthResponse } from "@chatgpt-codex-bridge/shared";
import { sendJson } from "../middleware/errorHandler.js";

export function handleHealth(response: ServerResponse, version: string): void {
  const body: HealthResponse = {
    ok: true,
    service: "chatgpt-codex-bridge",
    version
  };
  sendJson(response, 200, body);
}
