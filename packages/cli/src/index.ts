import { Command } from "commander";
import { description, name, version } from "../package.json";

const program = new Command();

program.name(name).description(description).version(version);
