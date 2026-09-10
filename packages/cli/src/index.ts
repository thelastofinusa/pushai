import { Command } from "commander";
import { description, name, version } from "../package.json";
import { generateCommitMessage, detectOllama } from "@pushai/core";

const program = new Command();

program.name(name).description(description).version(version);
