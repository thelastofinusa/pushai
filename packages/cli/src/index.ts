import { checkForUpdate } from "@pushai/utils";
import chalk from "chalk";
import { Command } from "commander";
import { actions } from "./actions";
import { pkgConfig } from "./config/config.config";

const program = new Command();

program
  .name(pkgConfig.name)
  .description(pkgConfig.description)
  .version(pkgConfig.version, "-v, --version");

Object.values(actions).forEach((action) => {
  action.register(program);
});

program.parse(process.argv);

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
