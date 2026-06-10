import { appendServiceLog } from "../../runtime/fileLogger.js";
import { getServiceManager } from "../../service/index.js";
import { logger } from "../../utils/logger.js";

export async function runInstallServiceCommand(): Promise<void> {
  const serviceManager = getServiceManager();
  const status = await serviceManager.getStatus();
  if (status.state === "installed") {
    logger.info("Auto-start service is already installed.");
    return;
  }
  await serviceManager.install();
  await appendServiceLog(`Auto-start service installed on ${serviceManager.platform}.`);
  logger.info("Auto-start service installed.");
}
