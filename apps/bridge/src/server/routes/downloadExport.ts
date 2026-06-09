import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { ServerResponse } from "node:http";
import { stat } from "node:fs/promises";
import { sendApiError } from "../middleware/errorHandler.js";

export async function handleDownloadExport(filename: string, response: ServerResponse): Promise<void> {
  const decodedFilename = decodeURIComponent(filename);
  if (!isSafeExportFilename(decodedFilename)) {
    sendApiError(response, 400, "INVALID_EXPORT_FILENAME", "Invalid export filename");
    return;
  }

  const exportsDir = getExportsDirectory();
  const exportPath = path.join(exportsDir, decodedFilename);
  if (path.dirname(exportPath) !== exportsDir) {
    sendApiError(response, 400, "PATH_TRAVERSAL_DETECTED", "Path traversal detected");
    return;
  }

  let exportStats;
  try {
    exportStats = await stat(exportPath);
  } catch {
    sendApiError(response, 404, "EXPORT_NOT_FOUND", "Export package was not found");
    return;
  }

  if (!exportStats.isFile()) {
    sendApiError(response, 404, "EXPORT_NOT_FOUND", "Export package was not found");
    return;
  }

  response.writeHead(200, {
    "Content-Type": "application/zip",
    "Content-Length": String(exportStats.size),
    "Content-Disposition": `attachment; filename="${decodedFilename}"`
  });

  fs.createReadStream(exportPath).pipe(response);
}

export function buildExportDownloadUrl(packagePath: string): string {
  return `/exports/${encodeURIComponent(path.basename(packagePath))}`;
}

function isSafeExportFilename(filename: string): boolean {
  return /^chatgpt-context-package-[A-Za-z0-9._-]+\.zip$/.test(filename);
}

function getExportsDirectory(): string {
  return path.join(os.homedir(), ".chatgpt-codex-bridge", "exports");
}
