import os from "node:os";
import path from "node:path";
import { stat } from "node:fs/promises";
import type { BridgeConfig, BridgeProject } from "@chatgpt-codex-bridge/shared";
import { ensureDirectory, readJsonFile, writeJsonFile } from "../utils/fileSystem.js";
import { defaultBridgeConfig, isValidProjectId, validateBridgeConfig } from "./configSchema.js";
import { discoverBridgeProjects } from "./projectDiscovery.js";

export function getConfigDirectory(): string {
  return path.join(os.homedir(), ".chatgpt-codex-bridge");
}

export function getConfigPath(): string {
  return path.join(getConfigDirectory(), "config.json");
}

export async function loadBridgeConfig(): Promise<BridgeConfig> {
  const raw = await readJsonFile<unknown>(getConfigPath());
  const config = raw === null ? defaultBridgeConfig : validateBridgeConfig(raw);
  if (raw !== null && needsMigration(raw, config)) {
    await saveBridgeConfig(config);
  }
  return config;
}

export async function loadBridgeConfigWithDiscoveredProjects(): Promise<BridgeConfig> {
  const config = await loadBridgeConfig();
  const discoveredProjects = await discoverBridgeProjects(config.projects);
  return {
    ...config,
    projects: [...config.projects, ...discoveredProjects]
  };
}

export async function saveBridgeConfig(config: BridgeConfig): Promise<void> {
  await ensureDirectory(getConfigDirectory());
  await writeJsonFile(getConfigPath(), config);
}

export async function initializeBridgeConfig(): Promise<BridgeConfig> {
  const existing = await readJsonFile<unknown>(getConfigPath());
  if (existing !== null) {
    return validateBridgeConfig(existing);
  }

  await saveBridgeConfig(defaultBridgeConfig);
  return defaultBridgeConfig;
}

export async function setDefaultProjectPath(projectPath: string): Promise<BridgeConfig> {
  const config = await loadBridgeConfig();
  const resolvedProjectPath = await resolveExistingDirectory(projectPath);
  const projects = config.projects.filter((project) => project.id !== "default");
  const defaultProject: BridgeProject = {
    id: "default",
    name: "default",
    path: resolvedProjectPath
  };
  const nextConfig: BridgeConfig = {
    ...config,
    projects: [defaultProject, ...projects],
    defaultProjectId: defaultProject.id
  };
  await saveBridgeConfig(nextConfig);
  return nextConfig;
}

export async function addProject(id: string, projectPath: string): Promise<BridgeConfig> {
  assertValidProjectId(id);
  const config = await loadBridgeConfig();
  if (config.projects.some((project) => project.id === id)) {
    throw new Error(`PROJECT_ALREADY_EXISTS: ${id}`);
  }

  const resolvedProjectPath = await resolveExistingDirectory(projectPath);
  const nextConfig: BridgeConfig = {
    ...config,
    projects: [
      ...config.projects,
      {
        id,
        name: id,
        path: resolvedProjectPath
      }
    ],
    defaultProjectId: config.defaultProjectId ?? id
  };
  await saveBridgeConfig(nextConfig);
  return nextConfig;
}

export async function removeProject(id: string): Promise<BridgeConfig> {
  const config = await loadBridgeConfig();
  const projects = config.projects.filter((project) => project.id !== id);
  if (projects.length === config.projects.length) {
    throw new Error(`PROJECT_NOT_FOUND: ${id}`);
  }

  const nextConfig: BridgeConfig = {
    ...config,
    projects,
    defaultProjectId: config.defaultProjectId === id ? projects[0]?.id : config.defaultProjectId
  };

  if (nextConfig.defaultProjectId === undefined) {
    delete nextConfig.defaultProjectId;
  }

  await saveBridgeConfig(nextConfig);
  return nextConfig;
}

export async function setDefaultProject(id: string): Promise<BridgeConfig> {
  const config = await loadBridgeConfig();
  if (!config.projects.some((project) => project.id === id)) {
    throw new Error(`PROJECT_NOT_FOUND: ${id}`);
  }

  const nextConfig: BridgeConfig = {
    ...config,
    defaultProjectId: id
  };
  await saveBridgeConfig(nextConfig);
  return nextConfig;
}

export function getDefaultProject(config: BridgeConfig): BridgeProject | undefined {
  return config.projects.find((project) => project.id === config.defaultProjectId) ?? config.projects[0];
}

export function getProjectById(config: BridgeConfig, id: string | undefined): BridgeProject | undefined {
  if (!id) {
    return getDefaultProject(config);
  }
  return config.projects.find((project) => project.id === id);
}

async function resolveExistingDirectory(projectPath: string): Promise<string> {
  const resolvedProjectPath = path.resolve(projectPath);
  let stats;
  try {
    stats = await stat(resolvedProjectPath);
  } catch {
    throw new Error("PROJECT_PATH_NOT_FOUND");
  }

  if (!stats.isDirectory()) {
    throw new Error("PROJECT_PATH_NOT_FOUND");
  }

  return resolvedProjectPath;
}

function assertValidProjectId(id: string): void {
  if (!isValidProjectId(id)) {
    throw new Error("PROJECT_ID_INVALID");
  }
}

function needsMigration(raw: unknown, config: BridgeConfig): boolean {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    return false;
  }
  const record = raw as Record<string, unknown>;
  return record.defaultProjectPath !== undefined || record.projects === undefined || record.defaultProjectId !== config.defaultProjectId;
}
