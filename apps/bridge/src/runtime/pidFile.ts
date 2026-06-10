import { readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { ensureDirectory, pathExists } from "../utils/fileSystem.js";
import { getPidPath } from "./paths.js";

export async function readPidFile(): Promise<number | undefined> {
  if (!(await pathExists(getPidPath()))) {
    return undefined;
  }

  const raw = await readFile(getPidPath(), "utf8");
  const pid = Number.parseInt(raw.trim(), 10);
  return Number.isInteger(pid) && pid > 0 ? pid : undefined;
}

export async function writePidFile(pid = process.pid): Promise<void> {
  await ensureDirectory(path.dirname(getPidPath()));
  await writeFile(getPidPath(), `${pid}\n`, "utf8");
}

export async function removePidFile(): Promise<void> {
  await rm(getPidPath(), { force: true });
}

export function isProcessAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

export async function stopPidProcess(pid: number): Promise<boolean> {
  try {
    process.kill(pid, "SIGTERM");
  } catch {
    return false;
  }

  for (let attempt = 0; attempt < 30; attempt += 1) {
    await delay(200);
    if (!isProcessAlive(pid)) {
      return true;
    }
  }
  return !isProcessAlive(pid);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
