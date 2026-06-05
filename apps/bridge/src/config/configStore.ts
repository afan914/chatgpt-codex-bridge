import os from "node:os";
import path from "node:path";
import type { BridgeConfig } from "@chatgpt-codex-bridge/shared";
import { ensureDirectory, readJsonFile, writeJsonFile } from "../utils/fileSystem.js";
import { defaultBridgeConfig, validateBridgeConfig } from "./configSchema.js";

export function getConfigDirectory(): string {
  return path.join(os.homedir(), ".chatgpt-codex-bridge");
}

export function getConfigPath(): string {
  return path.join(getConfigDirectory(), "config.json");
}

export async function loadBridgeConfig(): Promise<BridgeConfig> {
  const raw = await readJsonFile<unknown>(getConfigPath());
  return raw === null ? defaultBridgeConfig : validateBridgeConfig(raw);
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
  const nextConfig: BridgeConfig = {
    ...config,
    defaultProjectPath: path.resolve(projectPath)
  };
  await saveBridgeConfig(nextConfig);
  return nextConfig;
}
