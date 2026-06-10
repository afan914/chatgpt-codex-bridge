import os from "node:os";
import { createLinuxSystemdServiceManager } from "./linuxSystemd.js";
import { createMacosLaunchdServiceManager } from "./macosLaunchd.js";
import type { ServiceManager } from "./serviceTypes.js";
import { createWindowsTaskSchedulerServiceManager } from "./windowsTaskScheduler.js";

export function getServiceManager(): ServiceManager {
  const platform = os.platform();
  if (platform === "darwin") {
    return createMacosLaunchdServiceManager();
  }
  if (platform === "win32") {
    return createWindowsTaskSchedulerServiceManager();
  }
  if (platform === "linux") {
    return createLinuxSystemdServiceManager();
  }
  return {
    platform,
    async install() {
      throw new Error(`Auto-start service is unsupported on ${platform}.`);
    },
    async uninstall() {
      throw new Error(`Auto-start service is unsupported on ${platform}.`);
    },
    async stop() {
      return false;
    },
    async getStatus() {
      return { state: "unsupported", detail: `Unsupported platform: ${platform}` };
    }
  };
}
