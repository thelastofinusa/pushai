import { select } from "@inquirer/prompts";
import type { ProviderConfig, SetupMode } from "@pushai/types";
import { getPackageManager, showHeader } from "@pushai/utils";
import chalk from "chalk";
import { handleByokMode } from "../../handlers/byok.handler";
import { handleLocalMode } from "../../handlers/local.handler";
import { formatProvider } from "../../lib/format";
import { spinner } from "../../lib/spinner";
import { configStore } from "../../lib/store";

export async function runSetup() {
  showHeader({
    title: "Run PushAI setup wizard",
    color: chalk.magenta,
    symbol: "sparkle",
    type: "intro",
  });

  const existing = await configStore.getStoredConfig();

  if (existing) {
    return manageExisting(existing);
  }

  const provider = await runWizard();

  if (!provider) return;

  await saveProvider(provider, "Setup wizard completed successfully.");
}

/* -------------------------------------------------------------------------- */
/* Existing configuration: add / replace                                      */
/* -------------------------------------------------------------------------- */

async function manageExisting(existing: {
  activeId: string;
  providers: ProviderConfig[];
}) {
  console.log(chalk.dim("Configured providers:"));

  for (const p of existing.providers) {
    const isActive = p.id === existing.activeId;

    const marker = isActive ? chalk.green("◆") : chalk.dim("◇");

    const label = isActive
      ? chalk.green(formatProvider(p))
      : chalk.white(formatProvider(p));

    const tag = isActive ? chalk.green(" (active)") : "";

    console.log(`  ${marker} ${label}${tag}`);
  }

  console.log();

  const active = existing.providers.find((p) => p.id === existing.activeId);

  const action = await select({
    message: "What would you like to do?",
    choices: [
      {
        name: "Add a new provider",
        value: "add",
        description: "Keep existing providers and configure another one",
      },
      {
        name: "Replace the active provider",
        value: "replace",
        description: active
          ? `Replace "${formatProvider(active)}"`
          : "Replace the active provider",
      },
      {
        name: "Cancel",
        value: "cancel",
        description: "Leave the configuration as-is",
      },
    ],
  });

  if (action === "cancel") {
    showHeader({
      title: "Setup cancelled.",
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
      title: `Added "${formatProvider(provider)}" to your providers.`,
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
    title: `Active provider is now "${formatProvider(provider)}".`,
    color: chalk.green,
    symbol: "success",
    type: "outro",
  });
}

/* -------------------------------------------------------------------------- */
/* Wizard                                                                     */
/* -------------------------------------------------------------------------- */

async function runWizard(): Promise<ProviderConfig | undefined> {
  const pm = getPackageManager();

  const mode = await select<SetupMode>({
    message: "How would you like to generate commits?",
    choices: [
      {
        name: "PushAI Managed AI",
        value: "cloud",
        description: "Use PushAI's managed AI — authentication required",
      },
      {
        name: "Bring Your Own API Key",
        value: "byok",
        description: "Connect your own API key from supported providers",
      },
      {
        name: "Run AI Locally",
        value: "local",
        description: "Run AI on your machine — Ollama required",
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

  showHeader({
    title: "Feature coming soon",
    color: chalk.yellow,
    symbol: "info",
    type: "outro",
  });

  return;
}

async function saveProvider(provider: ProviderConfig, successTitle: string) {
  spinner.start("Saving configuration..");

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
      error instanceof Error ? error.message : "Failed to save configuration.";

    showHeader({
      title: errMsg,
      color: chalk.red,
      symbol: "error",
      type: "outro",
    });

    process.exit(1);
  }
}
