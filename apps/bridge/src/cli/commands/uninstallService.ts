import { appendServiceLog } from "../../runtime/fileLogger.js";
import { getServiceManager } from "../../service/index.js";
import { logger } from "../../utils/logger.js";

export async function runUninstallServiceCommand(): Promise<void> {
  const serviceManager = getServiceManager();
  const status = await serviceManager.getStatus();
  if (status.state === "not_installed") {
    logger.info("Auto-start service is not installed.");
    return;
  }
  await serviceManager.uninstall();
  await appendServiceLog(`Auto-start service uninstalled on ${serviceManager.platform}.`);
  logger.info("Auto-start service removed.");
}
