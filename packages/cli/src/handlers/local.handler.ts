import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { confirm, select } from "@inquirer/prompts";
import { ollamaProvider } from "@pushai/core";
import { setSpinnerColor, showHeader, sleep, spinner } from "@pushai/utils";
import chalk from "chalk";
import { getCommandTitle } from "../lib/command-title";

const execFileAsync = promisify(execFile);

const OLLAMA_DOWNLOAD_URL = "https://ollama.com/download";

async function openUrl(url: string) {
  if (process.platform === "win32") {
    await execFileAsync("cmd", ["/c", "start", "", url]);
  } else if (process.platform === "darwin") {
    await execFileAsync("open", [url]);
  } else {
    await execFileAsync("xdg-open", [url]);
  }
}

async function handleMissingOllama(baseCommand: string) {
  const windows = process.platform === "win32";

  const action = await select({
    message: "how would you like to proceed?",
    choices: [
      {
        name: windows
          ? "install ollama on windows"
          : process.platform === "darwin"
            ? "install ollama on macOS"
            : "install ollama on linux",
        value: "install",
        description: windows
          ? "run the official powershell installer"
          : "run the official terminal installer",
      },
      {
        name: "open download page",
        value: "download",
        description: `view the official website: ${OLLAMA_DOWNLOAD_URL}`,
      },
      {
        name: "exit setup",
        value: "exit",
        description: "cancel local ai setup",
      },
    ],
  });

  if (action === "install") {
    if (windows) {
      spinner.info("run this command in powershell:");

      console.log();
      console.log(
        `  ${chalk.cyan("irm https://ollama.com/install.ps1 | iex")}`,
      );
      console.log();

      spinner.info("restart your powershell after installation");
    } else {
      spinner.info("run this command in your terminal:");

      console.log();
      console.log(
        `  ${chalk.cyan("curl -fsSL https://ollama.com/install.sh | sh")}`,
      );
      console.log();

      spinner.info("restart your terminal after installation");
    }

    spinner.info(`then run ${chalk.cyan(baseCommand)} again`);

    showHeader({
      title: "come back when ollama is installed.",
      color: chalk.dim,
      symbol: "sparkle",
      type: "outro",
    });
  }

  if (action === "download") {
    const shouldOpen = await confirm({
      message: "open the ollama download page?",
      default: true,
    });

    if (!shouldOpen) {
      showHeader({
        title: "setup cancelled.",
        color: chalk.dim,
        symbol: "info",
        type: "outro",
      });
    }

    try {
      await openUrl(OLLAMA_DOWNLOAD_URL);

      showHeader({
        title: "ollama download page opened in your browser.",
        color: chalk.dim,
        symbol: "info",
        type: "outro",
      });
    } catch {
      showHeader({
        title: `could not open the browser automatically.\n  open this page manually: ${OLLAMA_DOWNLOAD_URL}`,
        color: chalk.red,
        symbol: "error",
        type: "outro",
      });
    }
  }

  if (action === "exit") {
    showHeader({
      title: "setup cancelled.",
      color: chalk.dim,
      symbol: "info",
      type: "outro",
    });
  }
}

async function handleMissingOllamaModels(baseCommand: string) {
  const action = await select({
    message: "how would you like to proceed?",
    choices: [
      {
        name: "browse ollama models",
        value: "browse",
        description: "view available models on the ollama library",
      },
      {
        name: "install a model",
        value: "install",
        description: "pull a model directly from the terminal",
      },
      {
        name: "exit setup",
        value: "exit",
        description: "cancel local ai setup",
      },
    ],
  });

  if (action === "browse") {
    const shouldOpen = await confirm({
      message: "open the ollama model library?",
      default: true,
    });

    if (!shouldOpen) {
      showHeader({
        title: "setup cancelled.",
        color: chalk.dim,
        symbol: "info",
        type: "outro",
      });
    }

    try {
      await openUrl("https://ollama.com/search");

      showHeader({
        title: "ollama model library opened in your browser.",
        color: chalk.dim,
        symbol: "info",
        type: "outro",
      });
    } catch {
      showHeader({
        title:
          "could not open the browser automatically.\n  open this page manually: https://ollama.com/search",
        color: chalk.red,
        symbol: "error",
        type: "outro",
      });
    }
  }

  if (action === "install") {
    spinner.info("install a model with:");

    console.log();
    console.log(`  ${chalk.cyan("ollama pull <model>")}`);
    console.log();

    spinner.info(`for example: ${chalk.cyan("ollama pull llama3.2")}`);
    spinner.info(`then run ${chalk.cyan(baseCommand)} again`);

    showHeader({
      title: "come back when a model is installed.",
      color: chalk.dim,
      symbol: "sparkle",
      type: "outro",
    });
  }

  if (action === "exit") {
    showHeader({
      title: "setup cancelled.",
      color: chalk.dim,
      symbol: "info",
      type: "outro",
    });
  }
}

export async function handleLocalMode(): Promise<string> {
  const { baseCommand } = getCommandTitle();
  setSpinnerColor("yellow");
  spinner.start("verifying ollama installation..");

  const ollama = await ollamaProvider();
  await sleep();

  if (!ollama.installed) {
    spinner.fail("ollama is not installed.");

    await handleMissingOllama(baseCommand);

    return "";
  }

  spinner.succeed(`ollama ${chalk.bold(`v${ollama.version}`)} detected`);

  spinner.start("finding local models..");
  await sleep(200);

  if (!ollama.models.length) {
    spinner.warn(chalk.yellow("no local models found"));

    await handleMissingOllamaModels(baseCommand);

    return "";
  }

  if (ollama.models.length > 1) {
    spinner.succeed(
      `you have ${chalk.cyan(ollama.models.length)} models installed`,
    );
  } else {
    spinner.succeed(
      `${chalk.bold(ollama.models[0])} is the only model installed`,
    );
  }

  let model = ollama.models[0];

  if (ollama.models.length > 1) {
    model = await select({
      message: "which model would you like to use?",
      choices: ollama.models.map((model) => ({
        name: model,
        value: model,
      })),
    });

    spinner.succeed(`${chalk.green(model)} selected and ready.`);
  } else {
    spinner.succeed(`using Ollama's ${chalk.green(model)} model`);
  }

  return model;
}
