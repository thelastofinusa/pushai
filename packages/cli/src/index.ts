import {
  checkForUpdate,
  getCliCommand,
  headerIcons,
  spinner,
} from "@pushai/utils";
import chalk from "chalk";
import { Command } from "commander";
import { actions } from "./actions";
import { pkgConfig } from "./config/config.config";

const invoked = process.argv[2];
const SKIP_PASSIVE_CHECK = new Set(["update", "-h", "--help"]);

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
              `update available: ${pkgConfig.name} v${info.latest} (current: v${info.current}). Run \`${command} update\`.`,
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
    .version(pkgConfig.version, "-v, --version", "show version");

  program.configureOutput({
    writeOut: (str) => {
      if (str.trim() === pkgConfig.version) {
        const nodeVersion = process.version;

        process.stdout.write(
          `v${pkgConfig.version}\n${`${headerIcons.chevron} node ${nodeVersion} (from PATH)`}\n`,
        );

        return;
      }

      process.stdout.write(str);
    },
  });

  Object.values(actions).forEach((action) => {
    action.register(program);
  });

  program.parse(process.argv);
}

void main();
