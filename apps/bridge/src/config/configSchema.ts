import type { BridgeConfig } from "@chatgpt-codex-bridge/shared";

export const defaultBridgeConfig: BridgeConfig = {
  port: 17321
};

export function validateBridgeConfig(input: unknown): BridgeConfig {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return defaultBridgeConfig;
  }

  const record = input as Record<string, unknown>;
  const port = typeof record.port === "number" && isValidPort(record.port) ? record.port : defaultBridgeConfig.port;
  const config: BridgeConfig = { port };

  if (record.defaultProjectPath !== undefined) {
    if (typeof record.defaultProjectPath !== "string") {
      throw new Error("defaultProjectPath must be a string when present");
    }
    config.defaultProjectPath = record.defaultProjectPath;
  }

  return config;
}

function isValidPort(port: number): boolean {
  return Number.isInteger(port) && port > 0 && port <= 65535;
}
