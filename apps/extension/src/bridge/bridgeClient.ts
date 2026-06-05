import type {
  HealthResponse,
  ImportChatGPTContextPayload,
  ImportChatGPTContextResponse
} from "@chatgpt-codex-bridge/shared";

const BRIDGE_BASE_URL = "http://127.0.0.1:17321";

export type BridgeHealthResult =
  | { ok: true; version?: string }
  | { ok: false; message: string };

export type SendToBridgeResult =
  | {
      ok: true;
      conversationSlug: string;
      outputDir: string;
      filesWritten: string[];
    }
  | {
      ok: false;
      code?: string;
      message: string;
    };

export async function checkBridgeHealth(): Promise<BridgeHealthResult> {
  try {
    const response = await fetch(`${BRIDGE_BASE_URL}/health`);
    if (!response.ok) {
      return { ok: false, message: `Bridge health check failed with HTTP ${response.status}` };
    }

    const body = (await response.json()) as HealthResponse;
    return body.ok ? { ok: true, version: body.version } : { ok: false, message: "Bridge returned an invalid health response" };
  } catch {
    return { ok: false, message: "Bridge is not reachable at http://127.0.0.1:17321" };
  }
}

export async function sendPayloadToBridge(payload: ImportChatGPTContextPayload): Promise<SendToBridgeResult> {
  try {
    const response = await fetch(`${BRIDGE_BASE_URL}/import-chatgpt-context`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const body = (await response.json()) as ImportChatGPTContextResponse;
    if (!body.ok) {
      return {
        ok: false,
        code: body.error.code,
        message: body.error.message
      };
    }

    return {
      ok: true,
      conversationSlug: body.conversationSlug,
      outputDir: body.outputDir,
      filesWritten: body.filesWritten
    };
  } catch {
    return {
      ok: false,
      message: "Could not send payload to Bridge"
    };
  }
}
