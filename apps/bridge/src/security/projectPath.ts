import { stat } from "node:fs/promises";
import path from "node:path";

export async function validateProjectPath(projectPath: string | undefined): Promise<string> {
  if (!projectPath) {
    throw new Error("PROJECT_PATH_NOT_CONFIGURED");
  }

  const resolvedProjectPath = path.resolve(projectPath);
  let stats;
  try {
    stats = await stat(resolvedProjectPath);
  } catch {
    throw new Error("PROJECT_PATH_NOT_FOUND");
  }

  if (!stats.isDirectory()) {
    throw new Error("PROJECT_PATH_NOT_FOUND");
  }

  return resolvedProjectPath;
}
