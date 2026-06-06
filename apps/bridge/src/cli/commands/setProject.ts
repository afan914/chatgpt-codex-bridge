import path from "node:path";
import { setDefaultProjectPath } from "../../config/configStore.js";
import { logger } from "../../utils/logger.js";

export async function runSetProjectCommand(projectPath: string | undefined): Promise<void> {
  if (!projectPath) {
    throw new Error("Usage: chatgpt-codex-bridge config set-project <path>");
  }

  const resolvedPath = path.resolve(projectPath);
  await setDefaultProjectPath(resolvedPath);
  logger.info(`Default project path set to ${resolvedPath}`);
}
