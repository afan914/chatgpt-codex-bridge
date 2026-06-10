import type { IncomingMessage, ServerResponse } from "node:http";
import type { BridgeConfig, ImportSuccessResponse } from "@chatgpt-codex-bridge/shared";
import { validateImportPayload } from "@chatgpt-codex-bridge/shared";
import { getProjectById, loadBridgeConfig } from "../../config/configStore.js";
import { exportAsPackage, importToCodexProject } from "../../writer/contextWriter.js";
import { appendServiceLog } from "../../runtime/fileLogger.js";
import { buildExportDownloadUrl } from "./downloadExport.js";
import { errorToApiError, sendApiError, sendJson } from "../middleware/errorHandler.js";

export async function handleImportChatGPTContext(
  request: IncomingMessage,
  response: ServerResponse,
  config: BridgeConfig
): Promise<void> {
  const bodyResult = await readJsonRequestBody(request);
  if (!bodyResult.ok) {
    sendApiError(response, 400, "INVALID_PAYLOAD", bodyResult.message);
    return;
  }

  const validation = validateImportPayload(bodyResult.value);
  if (!validation.ok) {
    sendApiError(response, 400, validation.error.code, validation.error.message);
    return;
  }

  try {
    const currentConfig = await loadBridgeConfig().catch(() => config);
    const destination = validation.value.destination ?? { type: "codex_project" as const };
    const result =
      destination.type === "package"
        ? await exportAsPackage({ ...validation.value, destination })
        : await importToCodexProject(resolveProjectPath(currentConfig, destination.projectId), {
            ...validation.value,
            destination
          });
    const body: ImportSuccessResponse = {
      ok: true,
      mode: result.mode,
      conversationSlug: result.conversationSlug,
      outputDir: result.outputDir,
      packagePath: result.packagePath,
      packageDownloadUrl: result.packagePath ? buildExportDownloadUrl(result.packagePath) : undefined,
      filesWritten: result.filesWritten
    };
    await appendServiceLog(`Import/export success mode=${result.mode} slug=${result.conversationSlug} files=${result.filesWritten.length}`);
    sendJson(response, 200, body);
  } catch (error) {
    const apiError = errorToApiError(error);
    await appendServiceLog(`Import/export failed code=${apiError.code} message=${apiError.message}`, "stderr");
    sendApiError(response, apiError.statusCode, apiError.code, apiError.message);
  }
}

function resolveProjectPath(config: BridgeConfig, projectId: string | undefined): string {
  const project = getProjectById(config, projectId);
  if (!project) {
    if (config.projects.length === 0) {
      throw new Error("NO_PROJECT_CONFIGURED");
    }
    throw new Error("PROJECT_NOT_FOUND");
  }

  return project.path;
}

async function readJsonRequestBody(request: IncomingMessage): Promise<
  | { ok: true; value: unknown }
  | { ok: false; message: string }
> {
  const chunks: Buffer[] = [];
  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  try {
    return { ok: true, value: JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown };
  } catch {
    return { ok: false, message: "request body must be valid JSON" };
  }
}
