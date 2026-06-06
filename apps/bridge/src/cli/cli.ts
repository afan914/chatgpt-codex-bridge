import { runInitCommand } from "./commands/init.js";
import { runProjectCommand } from "./commands/project.js";
import { runSetProjectCommand } from "./commands/setProject.js";
import { runStartCommand } from "./commands/start.js";
import { runStatusCommand } from "./commands/status.js";
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
