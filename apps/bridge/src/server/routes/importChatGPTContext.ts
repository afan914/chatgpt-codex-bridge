import type { IncomingMessage, ServerResponse } from "node:http";
import type { BridgeConfig, ImportSuccessResponse } from "@chatgpt-codex-bridge/shared";
import { validateImportPayload } from "@chatgpt-codex-bridge/shared";
import { writeContextExport } from "../../writer/contextWriter.js";
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
    const result = await writeContextExport(config.defaultProjectPath, validation.value);
    const body: ImportSuccessResponse = {
      ok: true,
      conversationSlug: result.conversationSlug,
      outputDir: result.outputDir,
      filesWritten: result.filesWritten
    };
    sendJson(response, 200, body);
  } catch (error) {
    const apiError = errorToApiError(error);
    sendApiError(response, apiError.statusCode, apiError.code, apiError.message);
  }
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
