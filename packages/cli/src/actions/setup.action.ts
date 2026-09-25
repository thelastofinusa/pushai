import { select } from "@inquirer/prompts";
import type { ProviderConfig, SetupMode } from "@pushai/types";
import {
  getCliCommand,
  getPackageManager,
  setSpinnerColor,
  showHeader,
  sleep,
  spinner,
} from "@pushai/utils";
import chalk from "chalk";
import { pkgConfig } from "../config/config.config";
import { configStore } from "../config/store.config";
import { handleByokMode } from "../handlers/byok.handler";
import { handleLocalMode } from "../handlers/local.handler";
import { formatProvider } from "../lib/format";

export async function setupAction(action: string) {
  const command = getCliCommand();

  showHeader({
    title: `${command} ${action} - v${pkgConfig.version}`,
    color: chalk.magenta,
  });

  setSpinnerColor("magenta");
  spinner.start("retrieving configuration");

  const existing = await configStore.getStoredConfig();
  await sleep(400);

  if (existing) {
    spinner.succeed("configuration retrieved");
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
  console.log();

  for (const p of existing.providers) {
    const isActive = p.id === existing.activeId;

    const label = isActive
      ? chalk.bgMagenta(formatProvider(p))
      : formatProvider(p);

    const tag = isActive ? chalk.dim(" (active)") : "";

    console.log(`  ${label}${tag}`);
  }

  console.log();

  const active = existing.providers.find((p) => p.id === existing.activeId);

  const action = await select({
    message: "what would you like to do?",
    choices: [
      {
        name: "add a new provider",
        value: "add",
        description: "Keep existing providers and configure another one",
      },
      {
        name: "replace active provider",
        value: "replace",
        description: active
          ? `Replace "${formatProvider(active)}"`
          : "Replace the active provider",
      },
      {
        name: "cancel",
        value: "cancel",
        description: "Leave the configuration as-is",
      },
    ],
  });

  if (action === "cancel") {
    showHeader({
      title: "setup cancelled.",
      color: chalk.dim,
      symbol: "info",
      type: "outro",
    });

    return;
  }

  const provider = await runWizard();

  if (!provider) return;

  if (action === "add") {
    await configStore.addProvider(provider, false);

    showHeader({
      title: `added "${formatProvider(provider)}" to your providers.`,
      color: chalk.green,
      symbol: "success",
      type: "outro",
    });

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
  const pm = getPackageManager();

  const mode = await select<SetupMode | "cancel">({
    message: "how should pushai generate commits?",
    choices: [
      {
        name: "use pushai cloud",
        value: "cloud",
        description: "Use PushAI's managed AI — no API key required",
      },
      {
        name: "use your own api key",
        value: "byok",
        description: "Connect an API key from a supported AI provider",
      },
      {
        name: "run ai locally",
        value: "local",
        description: "Run AI on your machine using Ollama",
      },
      {
        name: "cancel",
        value: "cancel",
        description: "Leave your configuration unchanged",
      },
    ],
  });

  if (mode === "local") {
    const model = await handleLocalMode(pm, "setup");

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
      title: "setup cancelled.",
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
