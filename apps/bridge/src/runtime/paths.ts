import os from "node:os";
import path from "node:path";

export function getAppHome(): string {
  return path.join(os.homedir(), ".chatgpt-codex-bridge");
}

export function getConfigPath(): string {
  return path.join(getAppHome(), "config.json");
}

export function getPidPath(): string {
  return path.join(getAppHome(), "bridge.pid");
}

export function getLogsDirectory(): string {
  return path.join(getAppHome(), "logs");
}

export function getBridgeLogPath(): string {
  return path.join(getLogsDirectory(), "bridge.log");
}

export function getBridgeErrorLogPath(): string {
  return path.join(getLogsDirectory(), "bridge.err.log");
}
