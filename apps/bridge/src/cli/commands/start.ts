import { loadBridgeConfig } from "../../config/configStore.js";
import { createBridgeServer } from "../../server/createServer.js";
import { logger } from "../../utils/logger.js";
import { readBridgeVersion } from "../../utils/packageVersion.js";

export async function runStartCommand(): Promise<void> {
  const config = await loadBridgeConfig();
  const version = readBridgeVersion();
  const server = createBridgeServer(config, version);
  const port = config.port;

  await new Promise<void>((resolve, reject) => {
    server.once("error", (error: NodeJS.ErrnoException) => {
      if (error.code === "EADDRINUSE") {
        reject(new Error(`Port ${port} is already in use. Please stop the existing process or change the port in ~/.chatgpt-codex-bridge/config.json.`));
        return;
      }
      reject(error);
    });

    // The Bridge can write local files, so it must bind only to localhost.
    server.listen(port, "127.0.0.1", () => {
      logger.info(`ChatGPT Codex Bridge running at http://127.0.0.1:${port}`);
      resolve();
    });
  });
}
