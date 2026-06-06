import path from "node:path";
import type { BridgeConfig, BridgeProject } from "@chatgpt-codex-bridge/shared";

export const defaultBridgeConfig: BridgeConfig = {
  port: 17321,
  projects: []
};

export function validateBridgeConfig(input: unknown): BridgeConfig {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return defaultBridgeConfig;
  }

  const record = input as Record<string, unknown>;
  const port = typeof record.port === "number" && isValidPort(record.port) ? record.port : defaultBridgeConfig.port;
  const projects = validateProjects(record.projects);
  const config: BridgeConfig = { port, projects };

  if (typeof record.defaultProjectId === "string" && projects.some((project) => project.id === record.defaultProjectId)) {
    config.defaultProjectId = record.defaultProjectId;
  }

  if (projects.length === 0 && record.defaultProjectPath !== undefined) {
    if (typeof record.defaultProjectPath !== "string" || record.defaultProjectPath.trim().length === 0) {
      throw new Error("defaultProjectPath must be a non-empty string when present");
    }
    const migratedProject: BridgeProject = {
      id: "default",
      name: "default",
      path: path.resolve(record.defaultProjectPath)
    };
    config.projects = [migratedProject];
    config.defaultProjectId = migratedProject.id;
  }

  return config;
}

export function isValidProjectId(id: string): boolean {
  return /^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(id);
}

function validateProjects(input: unknown): BridgeProject[] {
  if (input === undefined) {
    return [];
  }

  if (!Array.isArray(input)) {
    throw new Error("projects must be an array when present");
  }

  const seen = new Set<string>();
  const projects: BridgeProject[] = [];
  for (const item of input) {
    if (typeof item !== "object" || item === null || Array.isArray(item)) {
      throw new Error("each project must be an object");
    }

    const record = item as Record<string, unknown>;
    if (typeof record.id !== "string" || !isValidProjectId(record.id)) {
      throw new Error("project.id must be filename-safe");
    }

    if (seen.has(record.id)) {
      throw new Error(`duplicate project id: ${record.id}`);
    }

    if (typeof record.path !== "string" || record.path.trim().length === 0) {
      throw new Error("project.path must be a non-empty string");
    }

    seen.add(record.id);
    projects.push({
      id: record.id,
      name: typeof record.name === "string" && record.name.trim().length > 0 ? record.name : record.id,
      path: path.resolve(record.path)
    });
  }

  return projects;
}

function isValidPort(port: number): boolean {
  return Number.isInteger(port) && port > 0 && port <= 65535;
}
