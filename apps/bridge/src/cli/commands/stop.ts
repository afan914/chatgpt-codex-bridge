import { loadBridgeConfig } from "../../config/configStore.js";
import { appendServiceLog } from "../../runtime/fileLogger.js";
import { checkHealth } from "../../runtime/httpClient.js";
import { isProcessAlive, readPidFile, removePidFile, stopPidProcess } from "../../runtime/pidFile.js";
import { getServiceManager } from "../../service/index.js";
import { logger } from "../../utils/logger.js";

export async function runStopCommand(): Promise<void> {
  const config = await loadBridgeConfig();
  const serviceManager = getServiceManager();
  const serviceStatus = await serviceManager.getStatus();

  if (serviceStatus.state === "installed") {
    const stopped = await serviceManager.stop();
    if (stopped) {
      await waitUntilUnhealthy(config.port);
      logger.info("Bridge stopped through the platform service manager.");
      return;
    }
    logger.warn("Service manager stop failed. Falling back to PID file only if the service is not still managing the process.");
  }

  const pid = await readPidFile();
  if (pid === undefined) {
    logger.warn("Bridge is not running, or no PID file exists.");
    return;
  }

  if (!isProcessAlive(pid)) {
    await removePidFile();
    logger.warn("Removed stale PID file.");
    return;
  }

  const stopped = await stopPidProcess(pid);
  if (!stopped) {
    throw new Error(`Could not gracefully stop Bridge process ${pid}.`);
  }
  await removePidFile();
  await appendServiceLog(`Stopped Bridge process pid=${pid}`);
  logger.info("Bridge stopped.");
}

async function waitUntilUnhealthy(port: number): Promise<void> {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    if (!(await checkHealth(port))) {
      return;
    }
    await new Promise((resolve) => {
      setTimeout(resolve, 250);
    });
  }
}
