import type { BridgeConfig } from "@chatgpt-codex-bridge/shared";
import { addProject, loadBridgeConfig, removeProject, setDefaultProject } from "../../config/configStore.js";
import { logger } from "../../utils/logger.js";

export async function runProjectCommand(subcommand: string | undefined, id: string | undefined, projectPath: string | undefined): Promise<void> {
  if (subcommand === "list") {
    printProjects(await loadBridgeConfig());
    return;
  }

  if (subcommand === "add") {
    if (!id || !projectPath) {
      throw new Error("Usage: chatgpt-codex-bridge project add <id> <path>");
    }
    const config = await addProject(id, projectPath);
    logger.info(`Added project ${id}`);
    printProjects(config);
    return;
  }

  if (subcommand === "remove") {
    if (!id) {
      throw new Error("Usage: chatgpt-codex-bridge project remove <id>");
    }
    const config = await removeProject(id);
    logger.info(`Removed project ${id}`);
    printProjects(config);
    return;
  }

  if (subcommand === "set-default") {
    if (!id) {
      throw new Error("Usage: chatgpt-codex-bridge project set-default <id>");
    }
    const config = await setDefaultProject(id);
    logger.info(`Default project set to ${id}`);
    printProjects(config);
    return;
  }

  throw new Error("Usage: chatgpt-codex-bridge project <list|add|remove|set-default>");
}

function printProjects(config: BridgeConfig): void {
  if (config.projects.length === 0) {
    logger.info("No Codex projects configured.");
    return;
  }

  for (const project of config.projects) {
    const marker = project.id === config.defaultProjectId ? "*" : " ";
    logger.info(`${marker} ${project.id} (${project.name}) -> ${project.path}`);
  }
}
