import { getDefaultProject, loadBridgeConfig } from "../../config/configStore.js";
import { getServiceManager } from "../../service/index.js";
import { fetchProjects } from "../../runtime/httpClient.js";
import { checkHealth } from "../../runtime/httpClient.js";
import { getConfigPath } from "../../runtime/paths.js";
import { logger } from "../../utils/logger.js";

export async function runStatusCommand(): Promise<void> {
  const config = await loadBridgeConfig();
  const host = "127.0.0.1";
  const serviceStatus = await getServiceManager().getStatus();
  const isHealthy = await checkHealth(config.port);
  if (isHealthy) {
    const projects = await fetchProjects(config.port);
    const defaultProject = projects.find((project) => project.isDefault)?.name ?? getDefaultProject(config)?.name;
    logger.info(`Status: running
Host: ${host}
Port: ${config.port}
Config: ${getConfigPath()}
Projects: ${projects.length}
Default project: ${defaultProject ?? "(none)"}
Auto-start service: ${formatServiceStatus(serviceStatus.state)}`);
    return;
  }

  logger.warn(`Status: not running
Host: ${host}
Port: ${config.port}
Config: ${getConfigPath()}
Projects: ${config.projects.length}
Auto-start service: ${formatServiceStatus(serviceStatus.state)}

Start manually:
chatgpt-codex-bridge start

Or enable auto-start:
chatgpt-codex-bridge install-service`);
}

function formatServiceStatus(state: string): string {
  if (state === "installed") {
    return "installed";
  }
  if (state === "unsupported") {
    return "unsupported";
  }
  return "not installed";
}
