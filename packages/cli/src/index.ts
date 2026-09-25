import { checkForUpdate } from "@pushai/utils";
import chalk from "chalk";
import { Command } from "commander";
import { commands } from "./commands";
import { pkgConfig } from "./config/config.config";

const program = new Command();

program
  .name(pkgConfig.name)
  .description(pkgConfig.description)
  .version(pkgConfig.version);

Object.values(commands).forEach((command) => {
  command.register(program);
});

program.parse();

void (async () => {
  await Promise.race([
    (async () => {
      const info = await checkForUpdate(pkgConfig.name, pkgConfig.version);

      if (info.outdated) {
        console.log(
          `\n ${chalk.yellow("⚠")} ${chalk.dim(
            `PushAI ${info.latest} is available (you have ${info.current}). Run \`${pkgConfig.name} update\`.`,
          )}\n`,
        );
      }
    })(),
    new Promise((resolve) => setTimeout(resolve, 1500)),
  ]);
})();
