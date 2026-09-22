import { Command } from "commander";
import { description, name, version } from "../package.json";
import { peakCommand } from "./commands/peak.command";
import { resetCommand } from "./commands/reset.command";
import { setupCommand } from "./commands/setup.command";

const program = new Command();

program.name(name).description(description).version(version);

setupCommand.register(program);
peakCommand.register(program);
resetCommand.register(program);

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
