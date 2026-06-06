import { getConfigPath, initializeBridgeConfig } from "../../config/configStore.js";
import { logger } from "../../utils/logger.js";

export async function runInitCommand(): Promise<void> {
  const config = await initializeBridgeConfig();
  logger.info(`Config ready at ${getConfigPath()}`);
  logger.info(`Port: ${config.port}`);
  const defaultProject = config.projects.find((project) => project.id === config.defaultProjectId);
  if (defaultProject) {
    logger.info(`Default project: ${defaultProject.id} -> ${defaultProject.path}`);
  } else {
    logger.info("No Codex project is configured yet");
  }
}
