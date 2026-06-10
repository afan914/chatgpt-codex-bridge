import os from "node:os";
import path from "node:path";
import { rm, writeFile } from "node:fs/promises";
import { ensureDirectory, pathExists } from "../utils/fileSystem.js";
import { appendServiceLog } from "../runtime/fileLogger.js";
import { getBridgeErrorLogPath, getBridgeLogPath } from "../runtime/paths.js";
import { getCliCommand, runCommand } from "./processRunner.js";
import type { ServiceManager, ServiceStatus } from "./serviceTypes.js";

const PLIST_LABEL = "com.chatgpt-codex-bridge";

export function createMacosLaunchdServiceManager(): ServiceManager {
  const plistPath = getPlistPath();
  const serviceTarget = `gui/${process.getuid?.() ?? os.userInfo().uid}`;

  return {
    platform: "darwin",
    async install() {
      await ensureDirectory(path.dirname(plistPath));
      await ensureDirectory(path.dirname(getBridgeLogPath()));
      await writeFile(plistPath, buildPlist(), "utf8");
      let result = await runCommand("launchctl", ["bootstrap", serviceTarget, plistPath]);
      if (!result.ok) {
        result = await runCommand("launchctl", ["load", plistPath]);
      }
      await appendServiceLog(`macOS LaunchAgent install attempted: ${result.ok ? "success" : result.stderr.trim() || "failed"}`);
      if (!result.ok) {
        throw new Error(`Failed to install LaunchAgent: ${result.stderr.trim() || result.stdout.trim() || "launchctl failed"}`);
      }
    },
    async uninstall() {
      if (!(await pathExists(plistPath))) {
        return;
      }
      let result = await runCommand("launchctl", ["bootout", serviceTarget, plistPath]);
      if (!result.ok) {
        result = await runCommand("launchctl", ["unload", plistPath]);
      }
      await rm(plistPath, { force: true });
      await appendServiceLog(`macOS LaunchAgent uninstall attempted: ${result.ok ? "success" : result.stderr.trim() || "service was not loaded"}`);
    },
    async stop() {
      if (!(await pathExists(plistPath))) {
        return false;
      }
      let result = await runCommand("launchctl", ["bootout", serviceTarget, plistPath]);
      if (!result.ok) {
        result = await runCommand("launchctl", ["unload", plistPath]);
      }
      await appendServiceLog(`macOS LaunchAgent stop attempted: ${result.ok ? "success" : result.stderr.trim() || "failed"}`);
      return result.ok;
    },
    async getStatus(): Promise<ServiceStatus> {
      if (!(await pathExists(plistPath))) {
        return { state: "not_installed" };
      }
      return { state: "installed", detail: plistPath };
    }
  };
}

function getPlistPath(): string {
  return path.join(os.homedir(), "Library", "LaunchAgents", `${PLIST_LABEL}.plist`);
}

function buildPlist(): string {
  const cliCommand = getCliCommand();
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>${escapeXml(PLIST_LABEL)}</string>
  <key>ProgramArguments</key>
  <array>
    <string>${escapeXml(cliCommand)}</string>
    <string>start</string>
  </array>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <true/>
  <key>StandardOutPath</key>
  <string>${escapeXml(getBridgeLogPath())}</string>
  <key>StandardErrorPath</key>
  <string>${escapeXml(getBridgeErrorLogPath())}</string>
</dict>
</plist>
`;
}

function escapeXml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
