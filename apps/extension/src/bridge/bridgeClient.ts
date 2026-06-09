import type {
  HealthResponse,
  ImportChatGPTContextPayload,
  ImportChatGPTContextResponse,
  ProjectsResponse
} from "@chatgpt-codex-bridge/shared";

const BRIDGE_BASE_URL = "http://127.0.0.1:17321";

export type BridgeHealthResult =
  | { ok: true; version?: string }
  | { ok: false; message: string };

export type SendToBridgeResult =
  | {
      ok: true;
      mode: "codex_project" | "package";
      conversationSlug: string;
      outputDir?: string;
      packagePath?: string;
      packageDownloadUrl?: string;
      filesWritten: string[];
    }
  | {
      ok: false;
      code?: string;
      message: string;
    };

export type BridgeProjectOption = {
  id: string;
  name: string;
  path: string;
  isDefault: boolean;
};

export type ProjectsResult =
  | { ok: true; projects: BridgeProjectOption[] }
  | { ok: false; message: string };

export async function checkBridgeHealth(): Promise<BridgeHealthResult> {
  try {
    const response = await fetch(`${BRIDGE_BASE_URL}/health`);
    if (!response.ok) {
      return { ok: false, message: `Local service check failed with HTTP ${response.status}` };
    }

    const body = (await response.json()) as HealthResponse;
    return body.ok ? { ok: true, version: body.version } : { ok: false, message: "Local service returned an invalid health response" };
  } catch {
    return { ok: false, message: "Local service is not reachable at http://127.0.0.1:17321" };
  }
}

export async function fetchBridgeProjects(): Promise<ProjectsResult> {
  try {
    const response = await fetch(`${BRIDGE_BASE_URL}/projects`);
    if (!response.ok) {
      return { ok: false, message: `Project list failed with HTTP ${response.status}` };
    }

    const body = (await response.json()) as ProjectsResponse;
    return body.ok ? { ok: true, projects: body.projects } : { ok: false, message: "Invalid project list response" };
  } catch {
    return { ok: false, message: "Could not load project list from local service" };
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
      mode: body.mode,
      conversationSlug: body.conversationSlug,
      outputDir: body.outputDir,
      packagePath: body.packagePath,
      packageDownloadUrl: body.packageDownloadUrl ? `${BRIDGE_BASE_URL}${body.packageDownloadUrl}` : undefined,
      filesWritten: body.filesWritten
    };
  } catch {
    return {
      ok: false,
      message: "Could not send context to the local service"
    };
  }
}
