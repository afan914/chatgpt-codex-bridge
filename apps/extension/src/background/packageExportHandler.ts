import type { ImportChatGPTContextPayload } from "@chatgpt-codex-bridge/shared";
import { buildContextPackageZip } from "../package/buildContextPackage";

export type ExportContextPackageMessage = {
  type: "EXPORT_CONTEXT_PACKAGE";
  payload: ImportChatGPTContextPayload;
};

export type ExportContextPackageResponse =
  | {
      ok: true;
      filename: string;
      exportedBy: "extension";
    }
  | {
      ok: false;
      error: {
        code: string;
        message: string;
      };
    };

export function registerPackageExportHandler(): void {
  chrome.runtime.onMessage.addListener((message: unknown, _sender, sendResponse) => {
    if (!isExportContextPackageMessage(message)) {
      return false;
    }

    handleExportContextPackage(message.payload)
      .then(sendResponse)
      .catch((error: unknown) => {
        sendResponse({
          ok: false,
          error: {
            code: "BROWSER_PACKAGE_EXPORT_FAILED",
            message: getSafeErrorMessage(error)
          }
        });
      });

    return true;
  });
}

async function handleExportContextPackage(payload: ImportChatGPTContextPayload): Promise<ExportContextPackageResponse> {
  const { blob, filename } = await buildContextPackageZip(payload);
  const downloadUrl = await createDownloadUrl(blob);
  try {
    await chrome.downloads.download({
      url: downloadUrl.url,
      filename,
      saveAs: true
    });
    if (downloadUrl.shouldRevoke) {
      setTimeout(() => URL.revokeObjectURL(downloadUrl.url), 30_000);
    }
    return {
      ok: true,
      filename,
      exportedBy: "extension"
    };
  } catch (error) {
    if (downloadUrl.shouldRevoke) {
      URL.revokeObjectURL(downloadUrl.url);
    }
    throw error;
  }
}

async function createDownloadUrl(blob: Blob): Promise<{ url: string; shouldRevoke: boolean }> {
  if (typeof URL.createObjectURL === "function") {
    return {
      url: URL.createObjectURL(blob),
      shouldRevoke: true
    };
  }

  const bytes = new Uint8Array(await blob.arrayBuffer());
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return {
    url: `data:application/zip;base64,${btoa(binary)}`,
    shouldRevoke: false
  };
}

function isExportContextPackageMessage(message: unknown): message is ExportContextPackageMessage {
  return (
    typeof message === "object" &&
    message !== null &&
    "type" in message &&
    (message as { type?: unknown }).type === "EXPORT_CONTEXT_PACKAGE" &&
    "payload" in message &&
    typeof (message as { payload?: unknown }).payload === "object" &&
    (message as { payload?: unknown }).payload !== null
  );
}

function getSafeErrorMessage(error: unknown): string {
  return error instanceof Error && error.message.trim().length > 0 ? error.message : "Package export failed";
}
