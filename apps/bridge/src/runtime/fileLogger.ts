import { appendFile, rename, rm, stat } from "node:fs/promises";
import { ensureDirectory } from "../utils/fileSystem.js";
import { getBridgeErrorLogPath, getBridgeLogPath, getLogsDirectory } from "./paths.js";

const MAX_LOG_SIZE_BYTES = 10 * 1024 * 1024;
const RETAINED_LOGS = 3;

export async function appendServiceLog(message: string, stream: "stdout" | "stderr" = "stdout"): Promise<void> {
  const logPath = stream === "stdout" ? getBridgeLogPath() : getBridgeErrorLogPath();
  try {
    await rotateLogIfNeeded(logPath);
    await appendFile(logPath, `[${new Date().toISOString()}] ${message}\n`, "utf8");
  } catch {
    // Logging must never prevent the local bridge from serving requests.
  }
}

export async function rotateLogIfNeeded(logPath = getBridgeLogPath()): Promise<void> {
  await ensureDirectory(getLogsDirectory());
  let size = 0;
  try {
    size = (await stat(logPath)).size;
  } catch {
    return;
  }

  if (size <= MAX_LOG_SIZE_BYTES) {
    return;
  }

  await rm(`${logPath}.${RETAINED_LOGS}`, { force: true });
  for (let index = RETAINED_LOGS - 1; index >= 1; index -= 1) {
    try {
      await rename(`${logPath}.${index}`, `${logPath}.${index + 1}`);
    } catch {
      // Missing rotated files are fine.
    }
  }
  try {
    await rename(logPath, `${logPath}.1`);
  } catch {
    // Another process may have rotated first.
  }
}
