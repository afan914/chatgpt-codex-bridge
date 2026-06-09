import http from "node:http";
import type { BridgeConfig } from "@chatgpt-codex-bridge/shared";
import { applyCorsHeaders, handleCorsPreflight } from "./middleware/cors.js";
import { sendApiError } from "./middleware/errorHandler.js";
import { handleDownloadExport } from "./routes/downloadExport.js";
import { handleHealth } from "./routes/health.js";
import { handleImportChatGPTContext } from "./routes/importChatGPTContext.js";
import { handleProjects } from "./routes/projects.js";

export function createBridgeServer(config: BridgeConfig, version: string): http.Server {
  return http.createServer(async (request, response) => {
    applyCorsHeaders(response);

    if (handleCorsPreflight(request, response)) {
      return;
    }

    const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "127.0.0.1"}`);

    if (request.method === "GET" && url.pathname === "/health") {
      handleHealth(response, version);
      return;
    }

    if (request.method === "GET" && url.pathname === "/projects") {
      await handleProjects(response);
      return;
    }

    if (request.method === "GET" && url.pathname.startsWith("/exports/")) {
      await handleDownloadExport(url.pathname.replace(/^\/exports\//, ""), response);
      return;
    }

    if (request.method === "POST" && url.pathname === "/import-chatgpt-context") {
      await handleImportChatGPTContext(request, response, config);
      return;
    }

    sendApiError(response, 404, "NOT_FOUND", "Route not found");
  });
}
