import { getCliCommand, headerIcons } from "@pushai/utils";
import { pkgConfig } from "../config/config.config";

export interface CommandContext {
  title: string;
  command: string;
}

export function getCommandTitle(): CommandContext {
  const cliCommand = getCliCommand(); // e.g., "pai"

  // Strip 'node' and the script path
  const args = process.argv.slice(2);

  // The first argument that doesn't start with a hyphen is the action (e.g., "commit")
  const action = args.find((arg) => !arg.startsWith("-")) || "";

  // Any arguments starting with a hyphen are flags (e.g., "-p", "--dry-run")
  const flags = args.filter((arg) => arg.startsWith("-"));

  // The base command without flags (e.g., "pai peak")
  const baseCommand = [cliCommand, action].filter(Boolean).join(" ");

  // The full command with flags (e.g., "pai peak -k")
  const fullCommand = [baseCommand, ...flags].filter(Boolean).join(" ");

  return {
    title: `${fullCommand} ${headerIcons.dot} v${pkgConfig.version}`,
    command: baseCommand,
  };
}
