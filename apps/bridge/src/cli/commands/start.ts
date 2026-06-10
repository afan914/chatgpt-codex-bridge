import { loadBridgeConfig } from "../../config/configStore.js";
import { appendServiceLog } from "../../runtime/fileLogger.js";
import { checkHealth } from "../../runtime/httpClient.js";
import { getConfigPath, getLogsDirectory } from "../../runtime/paths.js";
import { isProcessAlive, readPidFile, removePidFile, writePidFile } from "../../runtime/pidFile.js";
import { createBridgeServer } from "../../server/createServer.js";
import { logger } from "../../utils/logger.js";
import { readBridgeVersion } from "../../utils/packageVersion.js";

export async function runStartCommand(): Promise<void> {
  const config = await loadBridgeConfig();
  const host = "127.0.0.1";
  const version = readBridgeVersion();
  const port = config.port;
  const projectCount = config.projects.length;

  if (await checkHealth(port)) {
    logger.info(`Already running at http://${host}:${port}`);
    return;
  }

  const pid = await readPidFile();
  if (pid !== undefined) {
    if (!isProcessAlive(pid)) {
      await removePidFile();
      logger.warn("Removed stale PID file.");
    } else {
      throw new Error(`PID file points to a running process (${pid}), but health check failed. Check logs or stop that process before starting another Bridge.`);
    }
  }

  const server = createBridgeServer(config, version);
  await new Promise<void>((resolve, reject) => {
    server.once("error", (error: NodeJS.ErrnoException) => {
      if (error.code === "EADDRINUSE") {
        reject(new Error(`Port ${port} is already in use. Please stop the existing process or change the port in ${getConfigPath()}.`));
        return;
      }
      reject(error);
    });

    // The Bridge can write local files, so it must bind only to localhost.
    server.listen(port, host, () => {
      resolve();
    });
  });

  await writePidFile();
  await appendServiceLog(`Started Bridge host=${host} port=${port} config=${getConfigPath()} projects=${projectCount}`);
  logger.info(`ChatGPT Context Bridge is running

Host: ${host}
Port: ${port}
Config: ${getConfigPath()}
Logs: ${getLogsDirectory()}
Projects: ${projectCount}`);

  const shutdown = async (): Promise<void> => {
    server.close();
    await removePidFile();
    await appendServiceLog("Bridge stopped gracefully.");
    process.exit(0);
  };
  process.once("SIGINT", () => {
    void shutdown();
  });
  process.once("SIGTERM", () => {
    void shutdown();
  });
}
