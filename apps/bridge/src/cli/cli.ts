#!/usr/bin/env node
import { runInitCommand } from "./commands/init.js";
import { runInstallServiceCommand } from "./commands/installService.js";
import { runProjectCommand } from "./commands/project.js";
import { runSetProjectCommand } from "./commands/setProject.js";
import { runStartCommand } from "./commands/start.js";
import { runStatusCommand } from "./commands/status.js";
import { runStopCommand } from "./commands/stop.js";
import { runUninstallServiceCommand } from "./commands/uninstallService.js";
import { logger } from "../utils/logger.js";

export async function runCli(argv: string[]): Promise<void> {
  const normalizedArgv = argv[0] === "--" ? argv.slice(1) : argv;
  const [command = "start", subcommand, value, extraValue] = normalizedArgv;

  if (command === "init") {
    await runInitCommand();
    return;
  }

  if (command === "start") {
    await runStartCommand();
    return;
  }

  if (command === "status") {
    await runStatusCommand();
    return;
  }

  if (command === "stop") {
    await runStopCommand();
    return;
  }

  if (command === "install-service") {
    await runInstallServiceCommand();
    return;
  }

  if (command === "uninstall-service") {
    await runUninstallServiceCommand();
    return;
  }

  if (command === "--help" || command === "-h" || command === "help") {
    logger.info(`Usage: chatgpt-codex-bridge <command>

Commands:
  start              Start the local Bridge service
  status             Show local Bridge status
  stop               Stop the local Bridge service
  install-service    Install user-level auto-start service
  uninstall-service  Remove user-level auto-start service
  init               Create the default config file
  project            Manage configured Codex projects
`);
    return;
  }

  if (command === "config" && subcommand === "set-project") {
    await runSetProjectCommand(value);
    return;
  }

  if (command === "project") {
    await runProjectCommand(subcommand, value, extraValue);
    return;
  }

  throw new Error(`Unknown command: ${normalizedArgv.join(" ") || "(empty)"}`);
}

runCli(process.argv.slice(2)).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  logger.error(message);
  process.exitCode = 1;
});
