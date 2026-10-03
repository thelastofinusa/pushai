import { getCliCommand, headerIcons } from "@pushai/utils";
import type { Command } from "commander";
import { pkgConfig } from "../config/config.config";

export interface CommandContext {
  commandTitle: string;
  baseCommand: string;
  fullCommand: string;
}

export function getCommandTitle(command?: Command): CommandContext {
  const cliCommand = getCliCommand(); // e.g., "pai"
  const args = process.argv.slice(2);
  const action = args.find((arg) => !arg.startsWith("-")) || "";

  // Get raw user flags
  const rawFlags = args.filter((arg) => arg.startsWith("-"));
  let flags: string[] = [];

  if (command) {
    rawFlags.forEach((flag) => {
      // Handle grouped short flags (e.g., "-pk" -> "--push --key")
      if (flag.startsWith("-") && !flag.startsWith("--") && flag.length > 2) {
        const chars = flag.slice(1).split("");
        chars.forEach((char) => {
          const shortFlag = `-${char}`;
          const optDef = command.options.find((opt) => opt.short === shortFlag);
          flags.push(optDef?.long || shortFlag);
        });
      } else {
        // Handle standard flags (e.g., "-k" or "--key")
        const optDef = command.options.find(
          (opt) => opt.short === flag || opt.long === flag,
        );
        flags.push(optDef?.long || flag);
      }
    });
  } else {
    flags = rawFlags; // Fallback if command isn't passed
  }

  // Deduplicate flags (in case of overlaps)
  flags = [...new Set(flags)];

  const baseCommand = ["running", cliCommand, action].filter(Boolean).join(" ");
  const fullCommand = [baseCommand, ...flags].filter(Boolean).join(" ");

  return {
    commandTitle: `${fullCommand} ${headerIcons.bullet} v${pkgConfig.version}`,
    baseCommand: baseCommand,
    fullCommand: fullCommand,
  };
}
