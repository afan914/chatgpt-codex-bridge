import { appendServiceLog } from "../runtime/fileLogger.js";
import { getBridgeErrorLogPath, getBridgeLogPath } from "../runtime/paths.js";
import { getCliCommand, runCommand } from "./processRunner.js";
import type { ServiceManager, ServiceStatus } from "./serviceTypes.js";

const TASK_NAME = "ChatGPTCodexBridge";

export function createWindowsTaskSchedulerServiceManager(): ServiceManager {
  return {
    platform: "win32",
    async install() {
      const command = `"${getCliCommand()}" start >> "${getBridgeLogPath()}" 2>> "${getBridgeErrorLogPath()}"`;
      const result = await runCommand("schtasks", [
        "/Create",
        "/TN",
        TASK_NAME,
        "/SC",
        "ONLOGON",
        "/TR",
        command,
        "/F"
      ]);
      await appendServiceLog(`Windows scheduled task install attempted: ${result.ok ? "success" : result.stderr.trim() || "failed"}`);
      if (!result.ok) {
        throw new Error(`Failed to install scheduled task: ${result.stderr.trim() || result.stdout.trim() || "schtasks failed"}`);
      }
    },
    async uninstall() {
      const result = await runCommand("schtasks", ["/Delete", "/TN", TASK_NAME, "/F"]);
      await appendServiceLog(`Windows scheduled task uninstall attempted: ${result.ok ? "success" : result.stderr.trim() || "not installed"}`);
    },
    async stop() {
      const status = await this.getStatus();
      if (status.state !== "installed") {
        return false;
      }
      const result = await runCommand("schtasks", ["/End", "/TN", TASK_NAME]);
      await appendServiceLog(`Windows scheduled task stop attempted: ${result.ok ? "success" : result.stderr.trim() || "failed"}`);
      return result.ok;
    },
    async getStatus(): Promise<ServiceStatus> {
      const result = await runCommand("schtasks", ["/Query", "/TN", TASK_NAME]);
      return result.ok ? { state: "installed", detail: TASK_NAME } : { state: "not_installed" };
    }
  };
}
