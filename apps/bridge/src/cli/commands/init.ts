import { getConfigPath, initializeBridgeConfig } from "../../config/configStore.js";
import { logger } from "../../utils/logger.js";

export async function runInitCommand(): Promise<void> {
  const config = await initializeBridgeConfig();
  logger.info(`Config ready at ${getConfigPath()}`);
  logger.info(`Port: ${config.port}`);
  if (config.defaultProjectPath) {
    logger.info(`Default project path: ${config.defaultProjectPath}`);
  } else {
    logger.info("Default project path is not configured yet");
  }
}
