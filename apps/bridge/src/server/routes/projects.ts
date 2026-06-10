import type { ServerResponse } from "node:http";
import type { ProjectsResponse } from "@chatgpt-codex-bridge/shared";
import { loadBridgeConfig } from "../../config/configStore.js";
import { sendJson } from "../middleware/errorHandler.js";

export async function handleProjects(response: ServerResponse): Promise<void> {
  const config = await loadBridgeConfig();
  const body: ProjectsResponse = {
    ok: true,
    projects: config.projects.map((project) => ({
      id: project.id,
      name: project.name,
      path: project.path,
      isDefault: project.id === config.defaultProjectId
    }))
  };

  sendJson(response, 200, body);
}
