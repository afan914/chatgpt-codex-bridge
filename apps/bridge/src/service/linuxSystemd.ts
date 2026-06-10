import os from "node:os";
import path from "node:path";
import { rm, writeFile } from "node:fs/promises";
import { ensureDirectory, pathExists } from "../utils/fileSystem.js";
import { appendServiceLog } from "../runtime/fileLogger.js";
import { getBridgeErrorLogPath, getBridgeLogPath } from "../runtime/paths.js";
import { getCliCommand, runCommand } from "./processRunner.js";
import type { ServiceManager, ServiceStatus } from "./serviceTypes.js";

const SERVICE_NAME = "chatgpt-codex-bridge.service";

export function createLinuxSystemdServiceManager(): ServiceManager {
  const servicePath = getServicePath();

  return {
    platform: "linux",
    async install() {
      if (!(await isSystemdUserAvailable())) {
        throw new Error("systemd user services are unavailable in this environment.");
      }
      await ensureDirectory(path.dirname(servicePath));
      await ensureDirectory(path.dirname(getBridgeLogPath()));
      await writeFile(servicePath, buildServiceFile(), "utf8");
      const reload = await runCommand("systemctl", ["--user", "daemon-reload"]);
      const enable = reload.ok ? await runCommand("systemctl", ["--user", "enable", SERVICE_NAME]) : reload;
      const start = enable.ok ? await runCommand("systemctl", ["--user", "start", SERVICE_NAME]) : enable;
      await appendServiceLog(`Linux systemd user service install attempted: ${start.ok ? "success" : start.stderr.trim() || "failed"}`);
      if (!start.ok) {
        throw new Error(`Failed to install systemd user service: ${start.stderr.trim() || start.stdout.trim() || "systemctl failed"}`);
      }
    },
    async uninstall() {
      if (!(await pathExists(servicePath))) {
        return;
      }
      await runCommand("systemctl", ["--user", "stop", SERVICE_NAME]);
      await runCommand("systemctl", ["--user", "disable", SERVICE_NAME]);
      await rm(servicePath, { force: true });
      await runCommand("systemctl", ["--user", "daemon-reload"]);
      await appendServiceLog("Linux systemd user service uninstalled.");
    },
    async stop() {
      if (!(await pathExists(servicePath))) {
        return false;
      }
      const result = await runCommand("systemctl", ["--user", "stop", SERVICE_NAME]);
      await appendServiceLog(`Linux systemd user service stop attempted: ${result.ok ? "success" : result.stderr.trim() || "failed"}`);
      return result.ok;
    },
    async getStatus(): Promise<ServiceStatus> {
      if (!(await pathExists(servicePath))) {
        return { state: "not_installed" };
      }
      if (!(await isSystemdUserAvailable())) {
        return { state: "installed", detail: "Service file exists, but systemd user mode is not available." };
      }
      return { state: "installed", detail: servicePath };
    }
  };
}

function getServicePath(): string {
  return path.join(os.homedir(), ".config", "systemd", "user", SERVICE_NAME);
}

function buildServiceFile(): string {
  return `[Unit]
Description=ChatGPT Context Bridge

[Service]
ExecStart=${getCliCommand()} start
Restart=always
StandardOutput=append:${getBridgeLogPath()}
StandardError=append:${getBridgeErrorLogPath()}

[Install]
WantedBy=default.target
`;
}

async function isSystemdUserAvailable(): Promise<boolean> {
  return (await runCommand("systemctl", ["--user", "is-system-running"])).ok;
}
