import { execFile } from "node:child_process";
import path from "node:path";

export type CommandResult = {
  ok: boolean;
  stdout: string;
  stderr: string;
};

export function runCommand(command: string, args: string[]): Promise<CommandResult> {
  return new Promise((resolve) => {
    execFile(command, args, { windowsHide: true }, (error, stdout, stderr) => {
      resolve({
        ok: error === null,
        stdout,
        stderr
      });
    });
  });
}

export function getCliCommand(): string {
  const cliPath = process.argv[1];
  return cliPath ? path.resolve(cliPath) : "chatgpt-codex-bridge";
}
