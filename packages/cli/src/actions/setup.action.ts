import { confirm, Separator, select } from "@inquirer/prompts";
import type { ProviderConfig, SetupMode } from "@pushai/types";
import { setSpinnerColor, showHeader, spinner } from "@pushai/utils";
import chalk from "chalk";
import type { Command } from "commander";
import { configStore } from "../config/store.config";
import { handleByokMode } from "../handlers/byok.handler";
import { handleLocalMode } from "../handlers/local.handler";
import { getCommandTitle } from "../lib/command-title";
import { formatProvider } from "../lib/format";
import { showProviders } from "../lib/show";

export async function setupAction(command?: Command) {
  const { commandTitle } = getCommandTitle(command);

  showHeader({
    title: commandTitle,
    color: chalk.magenta,
  });

  setSpinnerColor("magenta");
  spinner.start("checking configuration..");

  const existing = await configStore.getStoredConfig();

  if (existing) {
    spinner.stop();
    return manageExisting(existing);
  }

  const provider = await runWizard();

  if (!provider) return;

  await saveProvider(provider, "setup wizard completed successfully.");
}

/* -------------------------------------------------------------------------- */
/* Existing configuration: add / replace                                      */
/* -------------------------------------------------------------------------- */

async function manageExisting(existing: {
  activeId: string;
  providers: ProviderConfig[];
}) {
  showProviders({
    providers: existing.providers,
    activeId: existing.activeId,
    color: chalk.magenta,
  });

  console.log();

  const active = existing.providers.find((p) => p.id === existing.activeId);

  const action = await select({
    message: "what would you like to do?",
    choices: [
      {
        name: "add provider",
        value: "add",
        description: "Keep existing setup and configure an additional provider",
      },
      {
        name: "replace active",
        value: "replace",
        description: active
          ? `Replace ${formatProvider(active, true)} with a new configuration`
          : "Replace the currently active provider configuration",
      },
      {
        name: "leave setup unchanged",
        value: "cancel",
        description: "Exit wizard without adding or updating provider settings",
      },
    ],
  });

  if (action === "cancel") {
    showHeader({
      title: "setup exited. no changes were applied.",
      color: chalk.dim,
      symbol: "info",
      type: "outro",
    });

    return;
  }

  const provider = await runWizard();

  if (!provider) return;

  if (action === "add") {
    const shouldSetActive = await confirm({
      message: `set "${formatProvider(provider, true)}" as the active provider?`,
      default: true,
    });

    await configStore.addProvider(provider, shouldSetActive);

    if (shouldSetActive) {
      showHeader({
        title: `active provider is now "${formatProvider(provider, true)}".`,
        color: chalk.green,
        symbol: "success",
        type: "outro",
      });
    } else {
      showHeader({
        title: `added "${formatProvider(provider, true)}" to your providers.`,
        color: chalk.green,
        symbol: "success",
        type: "outro",
      });
    }

    return;
  }

  // replace
  await configStore.addProvider(provider, true);

  if (provider.id !== existing.activeId) {
    // Only drop the old entry if it's a different id (e.g. swapping openai → gemini).
    await configStore.removeProvider(existing.activeId);
  }

  showHeader({
    title: `active provider is now "${formatProvider(provider)}".`,
    color: chalk.green,
    symbol: "success",
    type: "outro",
  });
}

/* -------------------------------------------------------------------------- */
/* Wizard                                                                     */
/* -------------------------------------------------------------------------- */

async function runWizard(): Promise<ProviderConfig | undefined> {
  spinner.stop();

  const mode = await select<SetupMode | "cancel">({
    message: "select a commit generation method:",
    choices: [
      {
        name: "local machine (Ollama)",
        value: "local",
        description: "Run models locally on your machine",
      },
      {
        name: "pushai cloud",
        value: "cloud",
        description: "Zero setup — managed AI with no API key required",
        disabled: "(coming soon)",
      },
      {
        name: "custom api key (BYOK)",
        value: "byok",
        description: "Bring your own API key (OpenAI, Anthropic, Gemini, etc.)",
      },

      new Separator(),
      {
        name: "leave setup unchanged",
        value: "cancel",
        description: "Exit wizard without adding or updating provider settings",
      },
    ],
  });

  if (mode === "local") {
    const model = await handleLocalMode();

    if (!model) return;

    return {
      id: "local",
      mode: "local",
      model,
    };
  }

  if (mode === "byok") {
    const byok = await handleByokMode();

    if (!byok) return;

    return {
      id: byok.provider,
      mode: "byok",
      provider: byok.provider,
      apiKey: byok.apiKey,
      model: byok.model,
    };
  }

  if (mode === "cancel") {
    showHeader({
      title: "setup exited. no changes were applied.",
      color: chalk.dim,
      symbol: "info",
      type: "outro",
    });

    return;
  }

  showHeader({
    title: `${mode} feature coming soon`,
    color: chalk.blueBright,
    symbol: "info",
    type: "outro",
  });

  return;
}

async function saveProvider(provider: ProviderConfig, successTitle: string) {
  spinner.start("saving configuration..");

  try {
    await configStore.addProvider(provider, true);

    spinner.stop();

    showHeader({
      title: successTitle,
      color: chalk.green,
      symbol: "success",
      type: "outro",
    });
  } catch (error) {
    spinner.stop();

    const errMsg =
      error instanceof Error ? error.message : "failed to save configuration.";

    showHeader({
      title: errMsg,
      color: chalk.red,
      symbol: "error",
      type: "outro",
    });

    process.exit(1);
  }
}
