import http from "node:http";
import { loadBridgeConfig } from "../../config/configStore.js";
import { logger } from "../../utils/logger.js";

export async function runStatusCommand(): Promise<void> {
  const config = await loadBridgeConfig();
  const isHealthy = await checkHealth(config.port);
  if (isHealthy) {
    logger.info(`Bridge is running at http://127.0.0.1:${config.port}`);
    return;
  }

  logger.warn(`Bridge is not responding at http://127.0.0.1:${config.port}`);
}

function checkHealth(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const request = http.get(
      {
        host: "127.0.0.1",
        port,
        path: "/health",
        timeout: 1000
      },
      (response) => {
        response.resume();
        resolve(response.statusCode === 200);
      }
    );

    request.on("error", () => resolve(false));
    request.on("timeout", () => {
      request.destroy();
      resolve(false);
    });
  });
}
