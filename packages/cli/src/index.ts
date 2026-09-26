import { checkForUpdate, getCliCommand, spinner } from "@pushai/utils";
import chalk from "chalk";
import { Command } from "commander";
import { actions } from "./actions";
import { pkgConfig } from "./config/config.config";

const invoked = process.argv[2];
const SKIP_PASSIVE_CHECK = new Set([
  "update",
  "-v",
  "--version",
  "-h",
  "--help",
]);

async function main() {
  if (!SKIP_PASSIVE_CHECK.has(invoked)) {
    await Promise.race([
      (async () => {
        const command = getCliCommand();
        const info = await checkForUpdate(pkgConfig.name, pkgConfig.version);

        if (info.outdated) {
          console.log();

          spinner.warn(
            chalk.dim(
              `PushAI v${info.latest} is available (you have v${info.current}).\n  Run \`${command} update\`.`,
            ),
          );
        }
      })(),
      new Promise((resolve) => setTimeout(resolve, 1500)),
    ]);
  }

  const program = new Command();

  program
    .name(pkgConfig.name)
    .description(pkgConfig.description)
    .version(pkgConfig.version, "-v, --version");

  Object.values(actions).forEach((action) => {
    action.register(program);
  });

  program.parse(process.argv);
}

void main();
